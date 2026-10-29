---
title: Panifex code review
description: 'coder review and respond: inline PR findings, re-reviews, merge gates, fix-this loop.'
---

# Code review

`bin/cake coder review` feeds your git diff to a read-only AI agent that reads the surrounding codebase for context, then surfaces real issues grouped by file with severity levels. Options verified in `src/Command/ReviewCommand.php` (`output`, `staged`, `commit`, `against`, `pr`, `full`, `comment`, `fail-on`, `focus`) and `src/Command/RespondCommand.php` (`output`, `pr`, `comment-id`, `comment-type`, `defer-reply`, `budget`, `max-steps`, `yes`, shell flags).

```bash
# Review everything since your last commit (staged + unstaged)
bin/cake coder review

# Review only staged changes
bin/cake coder review --staged

# PR-style review — your branch vs. another branch
bin/cake coder review --against=main

# Review a specific commit
bin/cake coder review --commit=abc1234

# Tell the agent what to prioritise
bin/cake coder review --against=main --focus=security,performance

# Review a pull request (diff fetched via the VCS API)
bin/cake coder review --pr=42

# ...and post the findings back to the PR as inline review comments
bin/cake coder review --pr=42 --comment
```

## Output format

Findings are grouped by file with three severity levels:

| Level | Meaning |
|---|---|
| Critical | Bugs that will cause failures, security vulnerabilities, data loss risks |
| Warning | Edge cases, missing error handling, performance concerns, breaking changes |
| Suggestion | Improvements worth considering but not blocking |

The review ends with a one-line verdict: **LGTM** / **LGTM with minor notes** / **Needs changes**.

## How it works

The `ReviewAgent` (`src/Agent/ReviewAgent.php`, backed by `src/Review/`) is a read-only agent: file, glob, and search tools, no editing tools. Before commenting on any changed function or class it reads the full file for context, so findings are grounded in the actual codebase rather than the diff alone. With the [application map](./project-setup.md) in the prompt it can tell an N+1 from a legitimate lazy load and flag queries against columns that do not exist.

## Focus areas

```bash
bin/cake coder review --focus=security
bin/cake coder review --focus=performance,tests
bin/cake coder review --staged --focus=bugs,security
```

Any plain-language description works: `security`, `performance`, `n+1 queries`, `missing tests`, `breaking changes`.

## Reviewing pull requests

`--pr=N` reviews a pull request instead of a local diff. The diff is fetched from the VCS API (GitHub or GitLab via `VcsProviderLocator`), so it works regardless of which branches exist in your local checkout. The checkout is only used by the agent's read tools to understand the surrounding code. Requires a token (`GITHUB_TOKEN` / `GITLAB_TOKEN` via `Panifex.credentials`, repo configured under `Panifex.vcs`); the token needs pull-request read permission, and write when using `--comment`.

```bash
# Print the review to the terminal
bin/cake coder review --pr=42

# Post it to the PR as a single review with inline comments
bin/cake coder review --pr=42 --comment
```

With `--comment`, each finding is anchored to the exact file and line as an inline review comment (severity included), under a summary body with the overall verdict. Findings that reference lines outside the diff are folded into the summary instead of being dropped. On GitLab, comments land as diff-position discussions; approval is only posted on explicit approve events, never automatic.

## Incremental re-reviews

Re-running `coder review --pr` on a PR Panifex has already reviewed does **not** repeat the whole review. Each posted review embeds an invisible marker recording the head commit it covered; on the next run Panifex finds it and reviews only the changes pushed since the last review (via the compare API), tells the agent what it already reported so findings are not repeated, labels the posted review as a follow-up, and exits early with "Nothing new to review" when the head commit is unchanged.

If the previously reviewed commit was force-pushed away and the compare cannot be resolved, Panifex falls back to a full review automatically. Pass `--full` to force a full re-review at any time:

```bash
bin/cake coder review --pr=42 --comment --full
```

This makes a `pull_request`-triggered workflow cheap to run on `synchronize`: each push reviews only its own delta instead of the entire PR again.

## Gating CI on the review

`--fail-on` makes the command exit non-zero when findings at or above the given severity exist, so a workflow can block a merge:

```bash
bin/cake coder review --pr=42 --comment --fail-on=critical   # fail on critical only
bin/cake coder review --pr=42 --fail-on=warning              # fail on critical or warning
```

`--fail-on` also works for local scopes (`--staged`, `--against=main`). Useful in pre-push hooks.

## Machine-readable review output

As with [`coder run`](./sessions-run.md), `--output=json` prints one JSON document on stdout. Diagnostics (including the review prose) go to stderr, so stdout pipes straight into `jq`. JSON mode always requests the structured findings block, so `verdict` and `findings` are populated even without `--comment` or `--fail-on`. Exit codes are unchanged.

```bash
bin/cake coder review --pr=42 --output=json | jq -r '.verdict'
```

`outcome` is `completed`, `nothing_to_review`, `findings_gate_failed` (`--fail-on` tripped), or `error`. For local scopes, head SHA and PR number are null.

## Reviewing every PR automatically

Scaffold `.github/workflows/panifex-review.yml` with `bin/cake coder install review`. Add the `ANTHROPIC_API_KEY` secret and every pull request gets reviewed. Or hand-roll the equivalent: checkout, PHP setup, `composer install`, then

```bash
bin/cake coder review \
  --pr=${{ github.event.pull_request.number }} \
  --comment \
  --fail-on=critical
```

`pull-requests: write` is what lets the default `GITHUB_TOKEN` post the review. Drop `--fail-on=critical` for an advisory review. The review agent is read-only and the diff comes from the API, so the job needs no database and no `--yes`-style approval flags.

## Acting on review comments

`coder respond` closes the loop from found to fixed. When a reviewer replies to a finding (or leaves any PR comment) asking Panifex to act, the command loads the comment, its thread, and the diff context, runs the coding agent against the instruction, pushes the resulting commit to the PR branch, and replies in the thread:

```bash
bin/cake coder respond --pr=42 --comment-id=123456 --comment-type=review

# Machine-readable result — one JSON document on stdout, diagnostics on stderr
bin/cake coder respond --pr=42 --comment-id=123456 --output=json
```

- `--comment-type=review` for inline review comments (the usual case), `--comment-type=issue` for comments in the PR conversation tab.
- `--output=json` reports the result, PR number, comment id, reply body, whether the reply was deferred or posted, whether anything was pushed, and usage. The same stdout/stderr discipline and usage shape as `coder run`. Exit codes are unchanged.
- `--defer-reply` requires JSON output and returns the intended reply without posting it, for control planes that publish under their own identity. Standalone runs normally omit it.
- If the comment asks a question rather than requesting a change, the agent answers in the thread and touches nothing.
- The reply always arrives: success (with the pushed SHA and diff stat), no-op, or a clear failure message. Threads never dangle.

Guardrails, enforced in PHP: fork PRs are refused. Panifex never pushes to a branch in someone else's repository; it replies explaining why instead. The checkout must match the PR head. The agent edits the working tree and the result is pushed, so a mismatched checkout aborts before the agent runs. In CI, check out the PR head ref. Confirmations are auto-denied as in `coder run`; pass `--yes` only where you would have approved them yourself.

Wire it to GitHub gated on `author_association` so only maintainers can trigger it. The workflow `if:` plus the fork-PR refusal enforce that twice. Comment events fire for anyone on public repos; never remove the gate.

## Next steps

- [Headless runs](./sessions-run.md) — JSON and exit-code conventions shared with review
- [Focused sessions](./sessions-focused.md) — `coder fix` for the issues review finds
- [Hosting connections](./connections-hosting.md) — VCS setup and the CI pattern in full
