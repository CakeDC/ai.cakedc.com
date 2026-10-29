---
title: Panifex reference
description: Every PANIFEX_* variable, utility commands, troubleshooting, limits.
---

# Reference

Environment variables, utility commands, troubleshooting, and honest limits. All values below mirror `config/panifex.php`. Env wins over file.

## Environment variables

Nothing requires editing a PHP file; everything is settable from env.

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Your Anthropic API key (required for the default provider) |
| `PANIFEX_PROVIDER` | `anthropic` | Provider name — must match a key in the AI plugin config |
| `PANIFEX_MODEL` | `claude-sonnet-4-6` | Model to use |
| `PANIFEX_MAX_STEPS` | `40` | Tool-call ceiling per run — cannot exceed the agent's own attribute |
| `PANIFEX_BUDGET` | `1.00` | Hard spend limit in USD per session |
| `PANIFEX_PROMPT_CACHE` | `true` | Anthropic prompt caching — the fixed prefix and the growing conversation |
| `PANIFEX_VERIFY_RED_GREEN` | `true` | Before `CreatePullRequest` opens a PR that adds tests, run them with the change and reverted, report both |
| `PANIFEX_COMPACTION_THRESHOLD` | `60000` | Conversation size (chars) that triggers automatic history compaction |
| `PANIFEX_COMPACTION_KEEP` | `4` | Recent messages kept verbatim when compacting |
| `PANIFEX_PRICE_INPUT` | auto | Input price per million tokens; unset resolves from the model catalog |
| `PANIFEX_PRICE_OUTPUT` | auto | Output price per million tokens; unset resolves from the model catalog |
| `PANIFEX_DB_MUTATIONS` | `false` | Enable the `MutateDatabase` tool — see [Safety](./safety.md) |
| `PANIFEX_DB_MUTATION_MAX_ROWS` | `100` | Affected-row ceiling above which a write is rolled back |
| `PANIFEX_RENDER_TABLES` | `true` | Draw markdown tables in the agent's answer as terminal tables |
| `PANIFEX_APP_MAP` | `true` | Enable the application map |
| `PANIFEX_APP_MAP_INDEX` | `true` | Inject the table index into every session's system prompt |
| `PANIFEX_APP_MAP_CACHE` | `true` | Persist the map between processes |
| `PANIFEX_SHELL` | `approve` | Shell mode: `off`, `allowlist`, `approve`, `yolo`. Production defaults to `off` |
| `PANIFEX_WORKTREE` | `false` | Enable worktree isolation (production defaults to `true`) |
| `PANIFEX_WORKTREE_PATH` | system temp | Absolute directory for isolation copies |
| `PANIFEX_MEMORY` | `file` | Session persistence: `file` (resume) or `none` |
| `PANIFEX_EVALS_PATH` | `ROOT/evals` | Where user eval cases live |
| `PANIFEX_EVALS_INCLUDE_BUILTIN` | `true` | Run the built-in suite alongside user cases |
| `PANIFEX_HEALING_ENABLED` | `false` | Enable the self-healing queue worker feature |
| `PANIFEX_HEALING_MODE` | `pr` | Healing mode: `pr` or `patch` |
| `PANIFEX_HEALING_QUEUE` | `healer` | Queue name for heal jobs |
| `PANIFEX_HEALING_THRESHOLD` | `1` | Failures before healing triggers |
| `PANIFEX_HEALING_BASE_BRANCH` | `main` | Base branch for fix pull requests |
| `PANIFEX_HEALING_BRANCH_PREFIX` | `panifex/heal-` | Prefix for fix branches |
| `PANIFEX_HEALING_BASELINE` | `true` | Gate on new failures, not a fully green suite |
| `PANIFEX_HEALING_STATIC_ANALYSIS` | `true` | Gate on PHPStan over changed files |
| `PANIFEX_HEALING_MAX_FILES` | `20` | File-count blast-radius cap |
| `PANIFEX_HEALING_MAX_DIFF_LINES` | `400` | Diff-size blast-radius cap |
| `PANIFEX_HEALING_SPECULUM` | `true` | Use Speculum context when available |
| `PANIFEX_GUARD_SECRETS` | `block` | Secret-exfiltration guard mode |
| `PANIFEX_GUARD_NETWORK` | `block` | Network-exfiltration guard mode (`block`, `confirm`, `off`) |
| `PANIFEX_GUARD_COMPOSER` | `block` | Composer-script guard mode |
| `PANIFEX_GUARD_INJECTION` | `false` | Enable the injection-shield classifier |
| `PANIFEX_GUARD_INJECTION_PROVIDER` | — | Provider for the injection classifier |
| `PANIFEX_GUARD_INJECTION_MODEL` | — | Model for the injection classifier |
| `PANIFEX_VCS_REPO` | — | Workspace repo as `owner/repo` |
| `PANIFEX_VCS_PROVIDER` | `github` | Workspace VCS provider |
| `PANIFEX_GITLAB_HOST` | `gitlab.com` | Default GitLab host |
| `GITHUB_TOKEN` | — | GitHub token for PRs, reviews, issue tools |
| `GITHUB_REPO` | — | Repository as `owner/repo` — activates the GitHub tools |
| `GITLAB_TOKEN` | — | GitLab token |
| `GITLAB_REPO` | — | GitLab project |
| `PANIFEX_ISSUE_TRACKER_PROVIDER` | `redmine` | Workspace tracker type |
| `PANIFEX_ISSUE_TRACKER_HOST` | — | Default tracker host |
| `REDMINE_HOST` | — | Redmine host |
| `REDMINE_PROJECT` | — | Redmine default project |
| `REDMINE_CLOSED_STATUS_ID` | `5` | Status treated as closed |
| `SENTRY_AUTH_TOKEN` | — | Sentry auth token with `issue:read` scope — activates `ReadSentryIssue` |
| `SENTRY_ORG` | — | Sentry organization slug |
| `SENTRY_PROJECT` | — | Sentry project slug — required for listing recent issues |
| `PANIFEX_REMOTE_HOST` | `0.0.0.0` | Bind interface for the remote UI |
| `PANIFEX_REMOTE_ADVERTISE_HOST` | — | Override for pairing-URL address detection |
| `PANIFEX_REMOTE_PORT` | `8787` | Port for the remote UI |
| `PANIFEX_REMOTE_PUBLIC_URL` | — | External URL for pairing QR codes behind a proxy |
| `PANIFEX_REMOTE_STORAGE` | system temp | Remote state directory |
| `PANIFEX_REMOTE_SESSION_LIFETIME` | `43200` | Paired session lifetime in seconds |
| `PANIFEX_REMOTE_ANSWER_TIMEOUT` | `600` | Approval answer timeout in seconds (timeouts deny) |
| `PANIFEX_REMOTE_POLL_MS` | `400` | UI poll interval in milliseconds |
| `PANIFEX_TELEGRAM_TOKEN` | — | Bot token — activates the Telegram transport |
| `PANIFEX_TELEGRAM_CHATS` | — | Comma-separated allowed chat ids |
| `PANIFEX_TELEGRAM_POLL_TIMEOUT` | `2` | Poll timeout in seconds |
| `PANIFEX_TELEGRAM_DEBUG` | `false` | Trace the Telegram pump |
| `PANIFEX_SLACK_BOT_TOKEN` | — | Bot user OAuth token (`xoxb-`) |
| `PANIFEX_SLACK_APP_TOKEN` | — | App-level token (`xapp-`) |
| `PANIFEX_SLACK_CHANNEL` | — | Default channel id |
| `PANIFEX_SLACK_USERS` | — | Comma-separated allowed user ids |
| `PANIFEX_SLACK_POLL_TIMEOUT` | `2` | Poll timeout in seconds |
| `PANIFEX_SLACK_DEBUG` | `false` | Trace the Slack pump |
| `PANIFEX_ROCKETCHAT_SERVER_URL` | — | Rocket.Chat server URL |
| `PANIFEX_ROCKETCHAT_USER_ID` | — | Rocket.Chat user id |
| `PANIFEX_ROCKETCHAT_AUTH_TOKEN` | — | Rocket.Chat auth token |
| `PANIFEX_ROCKETCHAT_ROOM` | — | Default room |
| `PANIFEX_ROCKETCHAT_USERS` | — | Comma-separated allowed user ids |
| `PANIFEX_ROCKETCHAT_POLL_TIMEOUT` | `2` | Poll timeout in seconds |
| `PANIFEX_ROCKETCHAT_EDIT_INTERVAL` | `3` | Turn-message edit throttle in seconds |
| `PANIFEX_ROCKETCHAT_DEBUG` | `false` | Trace the Rocket.Chat pump |

See also [Configuration](./configuration.md) for the full file reference, and the [self-healing table](./healing.md) for healer options.

## Utility commands

The agent commands (`coder code`, `coder run`, `coder fix`, `coder review`, `coder respond`, `coder explain`, `coder test`, `coder onboard`, `coder upgrade`, `coder eval`) each have their own page: [First session](./first-session.md), [Headless runs](./sessions-run.md), [Focused sessions](./sessions-focused.md), [Review](./review.md), [Upgrades](./upgrade.md), [Evals](./eval.md), [Self-healing](./healing.md). This section covers the supporting commands (names verified in `src/Command/*Command.php`).

`coder init` generates a starter `PANIFEX.md` by scanning your project (composer.json, test framework, codesniffer/PHPStan presence, `src/` structure); `--force` overwrites an existing file.

`coder map` shows the application map: what the agent sees when it looks at your tables. Reads the live connection and the booted application, so it is authoritative where a migration file is not: `coder map` (the index), `coder map Articles` (one table, in full), `coder map --all` (every table), `coder map --route=articles.view` (one route: middleware, rules, authorization), `coder map --plain` (exactly what the agent sees, uncoloured), `coder map --fresh` (discard the cached map and rebuild). Useful for warming the cache in CI.

`coder health` verifies the package is correctly set up. Run it after installation or when something is not working as expected; `--probe-provider` makes one minimal live model request, catching an invalid or revoked key before your first session. It checks the plugin config, an API key for the active provider (plus a live probe on request), the git repository and its first commit, the healing migration when healing is enabled, and integration status for VCS, trackers, and Sentry.

`coder install` holds the one-command installers: `remote`, `review` (scaffolds the PR-review workflow), `eval-ci` (scaffolds the nightly eval workflow), `guard` (prints the guard-pack hook entries to add to config). `codex` and `grok` explain their non-availability in this edition instead of installing anything.

`coder prune` removes worktrees left behind by interrupted sessions (`--dry-run` previews). Only directories matching the worktree pattern are touched. Never the main working tree.

`coder replay` re-dispatches a previous healing attempt (the most recent, the last for a job class, or a specific log entry by ID) for retrying after adjusting config or fixing something manually.

`coder healing_log` shows the self-healing audit log, filterable by type (`job`, `scheduled_task`), outcome (`patched`, `pr_opened`), and limit.

`coder gitlab_test` verifies GitLab wiring specifically. `coder remote`, `coder telegram`, `coder slack`, and `coder rocketchat` drive chat sessions (see [Chat connections](./connections-chat.md)). `coder eval NAME`, `coder tool NAME`, and `coder agent NAME [--full]` scaffold eval cases, tools, and agents (see [Extending](./extending.md)).

## Troubleshooting

`coder code` needs an interactive TTY. For pipes, CI jobs, and cron, use `coder run` instead, which runs the same agent with the same tools and reports a structured result and an exit code.

Session aborted past the budget: raise `PANIFEX_BUDGET` (the default $1.00 is intentionally conservative), or pass a higher `--budget` for one run.

`Path ... is outside the workspace root`: the agent tried to access a file outside the configured workspace (defaults to the app root). For monorepos or non-standard layouts, set `workspace` in `config/panifex.php` to the correct root path.

`Path ... matches protected pattern`: the agent tried to read or write a protected file (`.env`, `vendor/`, and friends). This is intentional. Protected paths are blocked in code, not via prompting. To unblock a path, remove or narrow the relevant `protected_paths` pattern.

`old_str not found` / `old_str appears N times`: the agent is editing from a stale read. Tell it to read the file again before editing.

PHPStan or style tool missing: install them as dev dependencies in the host app; the corresponding tools no-op gracefully until then.

Tests fail during a session: this is expected behaviour. When `RunTests` returns failures, the agent reads the output and attempts to fix the code. When it gets stuck, tell it what the failure means or paste the relevant stack trace as your next message.

Heal branch pushed but no PR opened: Panifex could not find a VCS token. Check the resolution order: `GITHUB_TOKEN` / `GITLAB_TOKEN` in env, then the `gh` CLI (`gh auth status`), then `Panifex.credentials` in config.

`git worktree add failed`: either the project is not inside a git repository (init and commit first), or the branch name already exists (delete `panifex/heal-ID` and retry).

Healer ran but did not fix the bug: the agent's fix is in the PR (or logged). Review the PR description for the agent's reasoning. When the diagnosis was wrong, close the PR and fix it manually. The attempt gives you a starting point and a working branch to build on.

Healer triggering repeatedly: heal jobs run once each, so repeats mean the original job keeps failing and `threshold` is 1. Raise the threshold or disable healing until the root cause is resolved (`PANIFEX_HEALING_ENABLED=false`).

Provider 401: first identify the layer. A missing model key is caught before the request, so a provider 401 usually means the key exists but is wrong or revoked. Verify it from the deployed release with `coder health --probe-provider`. For CI runs, check the secret passed by the workflow.

Chat transports silent: check the allowlist first (`--pair` output versus configured ids), then the debug trace (`PANIFEX_*_DEBUG`). Slack-specific: invite the app to the channel before it can post; the channel config wants the id, not the name; a slash-command dispatch failure means the session is not running. Telegram-specific: group privacy mode hides non-command messages (use a direct chat or turn it off); a webhook set on the bot disables `getUpdates` polling.

## Limitations and known risks

Things Panifex cannot do: no internet access (workspace files only); text-only reads (binaries refused; images only as vision attachments); no auto-commit or push in standard mode (edits stay unstaged; worktree plus `CommitAndPush` behind `ConfirmAction`); history persists as text (tool outputs and image attachments are not replayed — the agent re-reads what it needs; `memory=none` starts fresh every time); budgets estimated, not exact (token counts times approximate per-model pricing — actual charges may differ slightly); tests need a working environment (databases and services must be running before starting a session).

This tool modifies your codebase and runs commands. Always run it inside a committed git working tree so you have a clear undo path (`git checkout -- .`). For the full, honest account of the security model, including what the guards can and cannot contain, read [Safety](./safety.md).

## Next steps

- [Configuration](./configuration.md) — the file behind this table
- [Safety](./safety.md) — guard details
- [Hosting connections](./connections-hosting.md) — integrations behind the status checks
