---
title: Panifex headless runs
description: 'coder run for CI and cron: JSON output, exit codes, budgets, GitHub Actions.'
---

# Headless runs

```bash
bin/cake coder run "Add an active finder to the Articles table and a test for it"
```

`coder code` is a REPL and needs a terminal. `coder run` is the same agent, the same tools, and the same safety layer: run once, to completion, with nothing attached to stdin. Built for CI, cron, and scripts. Options verified in `src/Command/RunCommand.php` (`output`, `session`, `budget`, `model`, `provider`, `max-steps`, `yes`, `fail-on-denied`, `shell`, `off`, `allowlist`, `approve`, `yolo`, `worktree`, `no-worktree`).

It streams a plain-text log while it works and prints a summary at the end.

## Machine-readable output

`--output=json` prints one JSON document on stdout. Diagnostics go to stderr, so you can pipe stdout straight into `jq` without filtering:

```bash
bin/cake coder run "Fix the failing Articles test" --output=json | jq -r '.pr_url'
```

```json
{
  "ok": true,
  "outcome": "completed",
  "text": "Added the finder and a test covering both branches.",
  "steps": 12,
  "files_changed": ["src/Model/Table/ArticlesTable.php", "tests/TestCase/Model/Table/ArticlesTableTest.php"],
  "diff_stat": "2 files changed, 24 insertions(+)",
  "interactions_denied": 0,
  "usage": {
    "input_tokens": 18,
    "output_tokens": 2210,
    "cache_read_tokens": 231226,
    "cache_write_tokens": 18350,
    "cache_hit_rate": 0.9265,
    "estimated_cost_usd": 0.1563,
    "measured": true
  },
  "budget_usd": 1.0,
  "worktree": "/tmp/panifex-worktree-9f2ab1c4",
  "pr_url": "https://github.com/acme/app/pull/218"
}
```

`input_tokens` is fresh input only. With prompt caching on, most of a run's input arrives as `cache_read_tokens` billed at roughly 10%, and a well-cached run's fresh count is a rounding error. `cache_hit_rate` is the share of all input served from cache. `measured: false` means the provider never reported usage (the run died mid-stream) and `estimated_cost_usd` is Panifex's own estimate. Treat it as a floor, not a figure.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Completed |
| `1` | Agent or provider error, or an invalid option |
| `2` | Stopped — the spend limit was reached |
| `3` | A confirmation was auto-denied (only with `--fail-on-denied`) |
| `4` | Hit the step ceiling without finishing |

## Confirmations without a user

`AskUser` and `ConfirmAction` are not exposed to headless runs at all: their schemas and the rules about when to call them are interactive-session machinery, and shipping them to a run with nobody to answer costs tokens per step for two tools that could never do anything. In their place the agent gets one rule that matters more without a human: finish issue work by opening the pull request, unprompted, and never end a turn waiting for an answer nobody will give.

The tools that still guard real actions (`RunCake` (destructive commands), `RunShell` (under `shell=approve`), and `CommitAndPush`) do still ask, and with no terminal every confirmation is denied by default: nothing that would have needed a human "yes" happens without one.

Pass `--yes` to approve automatically instead. Only do that where you would have clicked through the prompts yourself. It green-lights destructive CakePHP commands and pushes.

`--fail-on-denied` turns any auto-denial into exit code 3, for pipelines that would rather fail loudly than get a partial result. Either way, the count is in the JSON as `interactions_denied`.

## Shell in unattended runs

`shell=approve`, the config default for `local` and `staging`, has no meaning with no one to approve. Rather than silently promoting it to `yolo`, `coder run` refuses those commands and says why. For a run that needs a shell, choose the policy deliberately:

```bash
bin/cake coder run "..." --allowlist   # only shell_allowlist commands
bin/cake coder run "..." --yolo        # unrestricted — trusted environments only
```

## Bounding a run

`--budget` and `--max-steps` override `budget_usd` and `max_steps` for one run. Both are hard stops: the run aborts and reports the outcome rather than continuing past the limit.

```bash
bin/cake coder run "..." --budget=0.50 --max-steps=25
```

`max_steps` is a ceiling, not a grant: each agent also declares its own `#[MaxSteps]` attribute, read by reflection, which cannot be raised at runtime. Setting `--max-steps` above it has no effect.

## In GitHub Actions

Worktree mode is worth forcing here: the agent edits an isolated copy and the live checkout is never touched.

```yaml
name: Panifex
on:
  workflow_dispatch:
    inputs:
      task:
        description: What should Panifex do?
        required: true

jobs:
  run:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: shivamathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-interaction --prefer-dist
      - name: Run Panifex
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
        run: |
          bin/cake coder run "${{ inputs.task }}" \
            --output=json \
            --worktree \
            --allowlist \
            --budget=2.00 \
            --max-steps=60 > result.json
      - run: jq -r '.text' result.json >> $GITHUB_STEP_SUMMARY
        if: always()
```

The job fails on any non-zero exit, so a run that blows the budget or hits the step ceiling fails the workflow rather than reporting success with half the work done.

## Next steps

- [First session](./first-session.md) — the interactive agent
- [Focused sessions](./sessions-focused.md) — fix, explain, test, onboard
- [Review](./review.md) — the other headless-friendly command with JSON output
