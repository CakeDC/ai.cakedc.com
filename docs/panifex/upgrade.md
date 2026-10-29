---
title: Panifex dependency upgrades
description: 'coder upgrade: audit, plan, resolve, fix, verify, one reviewable PR per major.'
---

# Dependency upgrades

`bin/cake coder upgrade` performs a major version upgrade of a Composer package (CakePHP itself included) the way a careful human would, with the safety boundaries enforced in PHP. Options verified in `src/Command/UpgradeCommand.php` (`audit`, `issue`, `headless`, `output`, `budget`, `max-steps`, `ref-issue`, `provider`, `model`, shell flags, `worktree`, `no-worktree`).

```bash
# What could be upgraded, and what blocks each one? Deterministic, no AI involved.
bin/cake coder upgrade --audit

# Same audit, mirrored to a tracker issue — built for the scheduler
bin/cake coder upgrade --audit --issue

# Upgrade one package across a major version
bin/cake coder upgrade cakephp/cakephp

# Upgrade several — sequential isolated sessions, one PR each
bin/cake coder upgrade cakephp/cakephp phpunit/phpunit

# No package? Multi-select from the audit interactively.
bin/cake coder upgrade
```

## The playbook

The session follows a fixed playbook:

1. **Audit** — `composer outdated` establishes what is installed and what is available; `composer why-not` names the packages whose constraints block the jump.
2. **Plan** — the agent reads the package's `UPGRADE.md` / `CHANGELOG.md` from `vendor/` (a narrow, docs-only carve-out of the `vendor/*` protected path, via `ReadPackageDocs`), searches your code for actual usages, and presents a plan covering only the breaking changes that affect your app. Nothing mutates until you confirm.
3. **Resolve** — the constraint is bumped and `composer update` runs. Solver conflicts are diagnosed with `why-not` and the blockers raised iteratively.
4. **Fix** — the code and config changes the upgrade guide requires, as minimal edits.
5. **Verify** — your test suite, PHPStan if installed, a boot smoke check, and code style.
6. **Deliver** — an honest summary (including which upgrade-guide items did *not* apply, and what your tests do *not* cover) and an offer to open a PR.

## What makes it safe

- **Worktree by default.** The whole upgrade (lockfile, `vendor/`, code edits) happens in an isolated git worktree. A failed resolution can never leave your live checkout broken. Opt out with `--no-worktree`.
- **Lifecycle scripts stay off.** Every composer mutation runs `--no-scripts` (composer scripts are arbitrary project PHP, the same path `ComposerScriptGuard` blocks). Scripts run only when a human approves them in the terminal, after the lockfile change is reviewable.
- **Composer is fenced.** The composer tool permits a fixed set of subcommands and refuses `--working-dir` / `--global`; `run-script` and `exec` are not available at all.
- **Green is not proven.** The final summary is required to say what the test suite did not exercise, rather than declaring the upgrade safe on a thin green run.

## One major per session

For a framework major that forces ecosystem packages to move together, the plan lists the full set before anything changes. That is one atomic change and one PR. **Independent majors are a different case**: pass several packages (or multi-select from the audit) and each runs as its own sequential session with a fresh agent context, fresh worktree, and fresh budget, delivering one PR per package, so a bad upgrade stays individually reviewable, bisectable, and revertable. Each session's prompt fences the scope to its own package, and every upgrade PR touches `composer.lock`, so after merging one, rebase the next and re-run `composer update` on its branch.

Major upgrades are long sessions. Consider raising the budget beyond the default $1 before starting one; in a batch the budget applies per package, not to the batch as a whole.

## Scheduled dependency watch

The audit needs no AI, no TTY, and costs nothing, so it is safe to run on the scheduler. With `--issue` it maintains **exactly one** tracker issue mirroring the audit (requires tracker credentials):

```php
// config/app.php — scheduled commands
// Schedule::command('coder upgrade --audit --issue')->daily();
```

- The first time majors appear, an issue titled something like "Composer major upgrades available" is opened, listing each package with its `why-not` blockers.
- When the audit changes, the issue body is updated in place. When it has not, nothing is written. No daily notification spam.
- When no major upgrades remain (you upgraded, or constraints resolved), the issue is commented on and closed.

The issue is the reminder; a human stays the trigger. Read it and run `bin/cake coder upgrade PACKAGE` to turn it into a PR, or wire up the unattended mode below.

## Unattended upgrades (--headless)

```bash
bin/cake coder upgrade cakephp/cakephp --headless --output=json --ref-issue=42
```

Headless mode runs the same playbook with no terminal: the plan-confirmation step is folded into the PR body, verification still gates delivery, and the PR opens automatically. **The pull request is the human gate**, the same trust model as the self-healer's `pr` mode. `--ref-issue=N` makes the PR body carry `Refs #N` (not "closes"; the audit issue closes itself once no majors remain).

Safety properties specific to headless:

- **Composer lifecycle scripts can never run.** Enabling them requires an interactive approval, and the headless interaction policy is permanently non-interactive. There is no flag that overrides this.
- Explicit targets only: headless refuses to pick packages itself.
- Budget (`--budget`, per package) and step ceiling (`--max-steps`) abort the run with distinct exit codes.
- `--output=json` emits one JSON document per package on stdout (progress goes to stderr): outcome, steps, diff stat, token usage, and PR URL.

## Label-triggered upgrades in CI

A label-triggered workflow closes the loop. The scheduler maintains the issue, a maintainer applies a label, CI opens the PR. The ephemeral runner with a scoped token is stronger containment than any in-process guard. Gate on the label (issue bodies are untrusted input — only a maintainer action may hand an agent write access), and keep concurrency to one upgrade at a time. Enabling the injection classifier fences what the issue reader returns.

The PRs carry the plan, the honest verification summary (including what the test suite did **not** cover), and the issue reference. Merge them and the next scheduled audit closes the issue by itself.

CI caveat shared with all agent-opened PRs: pull requests created with the workflow's default token do **not** trigger `pull_request` workflows (recursion guard). The upgrade arrives with no test run and no review attached. The in-session verification still ran, but if you want your normal PR checks too, pass a fine-grained personal token (or app token) with contents write and pull-requests write instead.

## Next steps

- [Headless runs](./sessions-run.md) — exit codes and JSON shared with headless upgrade
- [Code review](./review.md) — what reviews the upgrade PR
- [Safety](./safety.md) — guard pack and composer-script details
