---
title: Panifex self-healing
description: 'The healer: failed jobs and scheduled tasks diagnosed, patched, verified, delivered as PR.'
---

# Self-healing

When enabled, Panifex listens for failed queue jobs and failed scheduled tasks, dispatches an AI agent to diagnose the exception, patch the code, verify the fix with your test suite, and either open a pull request or apply the fix directly. All without you lifting a finger.

## How it works

1. A job fails: the queue fires its failure event.
2. Panifex's `JobFailureListener` (`src/Healing/JobFailureListener.php`) picks it up and dispatches a `HealJobFailure` job (`src/Job/`) to the `healer` queue (a separate queue from your normal workers).
3. A dedicated queue worker picks up the heal job. It creates an **isolated git worktree** on a fresh branch (`panifex/heal-ID`), spins up a `HealingAgent` pointed at that worktree, and feeds the agent the exception class, message, stack trace, and, when Speculum data is available, the full entries around it. The agent reads the failing code, applies a minimal fix via `EditFile`, and runs your test suite to verify.
4. After the agent finishes: in **`pr` mode** (default) it pushes the branch and opens a pull request with the agent's reasoning as the description; in **`patch` mode** it merges the fix back into the main workspace branch and re-dispatches the original job.
5. The worktree is cleaned up regardless of outcome.

`HealJobFailure` runs with a single attempt. A failing healer cannot create a healing loop with itself.

## Prerequisites

- Your project must be a **git repository** with a remote named `origin`.
- A **queue worker** must be running the `healer` queue (see below).
- For PR mode, a **VCS token** is required (`GITHUB_TOKEN` / `GITLAB_TOKEN`).
- For `patch` mode, the working tree must be clean when healing runs.

## Enabling the healer

Run the migration for the healing log, then enable via env:

```bash
bin/cake migrations migrate  # plugin migration for the healing log table
```

```env
PANIFEX_HEALING_ENABLED=true
```

The event listeners register automatically once this is set to `true`.

## Starting the healer worker

The healer runs on a dedicated queue to avoid competing with your normal workers:

```bash
bin/cake queue work --queue=healer
```

Run this alongside your existing workers. A running worker caches config at boot. It will not see changes to `PANIFEX_HEALING_MODE`, `PANIFEX_HEALING_PROVIDER`, or `PANIFEX_BUDGET` in env. Restart it after any config change, or it keeps healing with what it booted with.

## VCS token setup

For PR mode, Panifex needs a token with repo scope. Resolution order: `GITHUB_TOKEN` / `GITLAB_TOKEN` in env (or the `Panifex.credentials` config keys), then the GitHub CLI (`gh auth login`; if you have `gh` installed and authenticated, Panifex reads your token automatically with no extra config). If no token is found, the branch is pushed but the PR is not opened, and a log entry records that you need to configure a token.

## Configuration

All healer options live under the `healing` key in `config/panifex.php`:

| Option | Env var | Default | Description |
|---|---|---|---|
| `enabled` | `PANIFEX_HEALING_ENABLED` | `false` | Enable or disable the healer |
| `mode` | `PANIFEX_HEALING_MODE` | `pr` | `pr` opens a pull request; `patch` applies directly |
| `model` | `PANIFEX_HEALING_MODEL` | falls back to `Panifex.model` | Model heals run on — heals run unattended on the queue, so pinning a cheaper model here than your interactive `Panifex.model` is common |
| `provider` | `PANIFEX_HEALING_PROVIDER` | falls back to `Panifex.provider` | Provider heals run on |
| `queue` | `PANIFEX_HEALING_QUEUE` | `healer` | Queue name for the heal job |
| `threshold` | `PANIFEX_HEALING_THRESHOLD` | `1` | Failures before healing triggers |
| `base_branch` | `PANIFEX_HEALING_BASE_BRANCH` | `main` | Branch PRs are opened against |
| `branch_prefix` | `PANIFEX_HEALING_BRANCH_PREFIX` | `panifex/heal-` | Prefix for fix branches |
| `baseline` | `PANIFEX_HEALING_BASELINE` | `true` | Run the suite before the fix so the gate keys on new failures, not a fully green suite — set `false` for very slow suites |
| `static_analysis` | `PANIFEX_HEALING_STATIC_ANALYSIS` | `true` | Run PHPStan over the changed files and gate on it (skipped when not installed) |
| `max_files` | `PANIFEX_HEALING_MAX_FILES` | `20` | A heal touching more files is held back from auto-apply and flagged for review |
| `max_diff_lines` | `PANIFEX_HEALING_MAX_DIFF_LINES` | `400` | A heal changing more lines is held back from auto-apply |
| `protected_from_healing` | config only | migrations, `config/*`, `composer.json/.lock`, `.env*` | Modifying (not adding) these forces human review |
| `speculum` | `PANIFEX_HEALING_SPECULUM` | `true` | Use Speculum context when available |

By default (`threshold=1`) the healer triggers on the first failure. To wait until a job has failed several times before intervening (letting transient failures resolve themselves), set `PANIFEX_HEALING_THRESHOLD=3`.

## Verification gate

A heal is only auto-applied (in `patch` mode) when it passes a gate the harness runs itself. The agent cannot declare itself done:

- **Regression-test-first.** The healer is instructed to add a test that reproduces the failure before fixing, then show it green. New test files are detected and reported.
- **No new failures.** The suite is baselined before the fix, so the gate requires that the fix introduce no new failures, not that the whole suite is green (real apps carry pre-existing failures).
- **The regression test is proven.** When a heal is otherwise clean, the added test is run with the fix reverted (must fail) then restored (must pass). A red-to-green proof that it actually reproduces the bug, surfaced in the PR evidence.
- **A fix must change code.** A heal that touches only test files (or nothing) is treated as incomplete. Never auto-applied, and opened as a PR tagged `[incomplete]`. This stops an agent from "passing" a performance heal by adding a green test and changing no code.
- **Static analysis must be clean.** PHPStan runs over the heal's changed files; new errors hold it back from auto-apply and flag the PR `[needs review]`. Skipped when PHPStan is not installed. The heal's changes are also formatted before the PR.
- **Blast-radius limits.** A heal that touches too many files, changes too many lines, or modifies a migration, `config/*`, or `composer.json` is never auto-applied. It opens a PR flagged `[needs review]`. Adding a new migration is fine.

Every heal PR carries a Heal evidence block: new failures (if any), pre-existing failures, whether a regression test was added, files touched, and diff size, so review is quick and the "fixed" claim is backed rather than asserted. A PR that failed the gate is titled `[tests failing]` or `[needs review]`.

## PR mode vs patch mode

| | `pr` (default) | `patch` |
|---|---|---|
| Human review required | Yes — merge the PR | No — merged automatically |
| Tests must pass | No (PR opened regardless) | Yes (only merges on green) |
| Job re-dispatched | No | Yes, after merge |
| Best for | Production / sensitive code | CI environments / trusted agents |

## Speculum context

When Speculum data is available from local development monitoring, Panifex uses it to give the agent richer context: the full exception entry including class, message, and stack frames (`src/Healing/SpeculumReader.php`, `src/Tool/ReadSpeculumEntry.php`). No extra configuration is needed beyond `PANIFEX_HEALING_SPECULUM=true`. Panifex detects it automatically and degrades gracefully when it is not present. This is the CakePHP answer to the Telescope integration in the upstream docs: same role, Speculum-backed.

## Scheduled task healing

Panifex also listens for scheduled-task failures. The healing flow is identical to queue jobs: an isolated git worktree, an AI agent, a test run, then a PR or patch. The one difference: scheduled tasks are not re-dispatched after a patch (they run on their own schedule). The fix simply takes effect the next time the task runs. No extra configuration is needed beyond `PANIFEX_HEALING_ENABLED=true`.

## Per-class opt-out

Some jobs should never be auto-patched: payment processors, email senders, anything where an untested change would be worse than the failure. Use the `#[Healable(false)]` attribute to opt out (verified in `src/Attribute/Healable.php`):

```php
use Crustum\Panifex\Attribute\Healable;

#[Healable(false)]
class ChargeSubscription
{
    public function handle(): void
    {
        // Panifex will skip this job entirely — even when PANIFEX_HEALING_ENABLED=true.
    }
}
```

The listener checks for the attribute via reflection before dispatching a heal job. Jobs without the attribute, or with `#[Healable(true)]`, are healed normally.

## Audit log

Every healing attempt, successful or not, is written to the healing log table. View recent entries with (verified in `src/Command/HealingLogCommand.php`, `coder healing_log`):

```bash
bin/cake coder healing_log
bin/cake coder healing_log --type=job
bin/cake coder healing_log --type=scheduled_task
bin/cake coder healing_log --outcome=patched
bin/cake coder healing_log --outcome=pr_opened
bin/cake coder healing_log --limit=50
```

If the migration has not been run, healing continues normally. The log write degrades gracefully.

## Replaying a healing attempt

`bin/cake coder replay` (verified in `src/Command/ReplayCommand.php`) re-dispatches a previous healing attempt, useful when you want to retry after adjusting config or fixing something manually. Replay the most recent attempt, the last attempt for a job class, or a specific log entry by ID.

## Healer limitations

- The healer targets **code bugs**: logic errors the AI can diagnose and fix. It is not designed for infrastructure issues (database down, disk full).
- The fix branch is pushed to `origin`. Your CI pipeline will run on it and can catch anything the local test run missed.
- In `patch` mode, if tests fail the healer falls back to PR mode automatically so nothing is merged without verification.
- The healer never modifies `.env`, `vendor/`, `storage/`, or `.git/`. The same path guards apply as in interactive mode.

## Next steps

- [Focused sessions](./sessions-focused.md) — `coder fix`, the interactive cousin
- [Hosting connections](./connections-hosting.md) — tracker and Sentry setup behind the healer's context
