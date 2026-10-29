---
title: Panifex tools
description: 'All 35 built-in tools: files, runners, database, routes, git, hosting, interaction.'
---

# Tools

35 tools under `src/Tool/`, available to the agent in every session. A tool is a class extending `src/Tool/AbstractTool.php` (`description()`, `schema()`, `handle()`); the model's call runs real PHP in your application and the return value feeds back into the next step. All file reads happen in-process; everything that executes code runs as a subprocess, so a broken generated file cannot crash the agent session.

Restrict the set with the `Panifex.tools` allowlist (tool class base names). Integration tools are lazy: they load only when their integration is configured, so the agent never carries schemas for tools it could not use:

- Tracker tools (`ReadIssue`, `CreateIssue`, `AddIssueComment`) appear only with tracker credentials.
- `ReadSentryIssue` appears only with `Panifex.sentry.auth_token` set.
- `ReadSpeculumEntry` appears only when Speculum data is available.

Measure the cost and fix-rate trade-off of any toolset with `coder eval --agent`.

## Filesystem

`ReadFile` reads a text file, or a range of lines from it: pass an offset and limit to read around a `SearchCode` hit instead of the whole file. Ranged reads come back line-numbered, which matters because a whole-file read is re-sent on every later step of the turn. Binary files are refused; very large reads are truncated.

`Glob` lists files matching a pattern. Protected paths are excluded from results, and `ignored_directories` keeps recursive walks out of dependency and build directories.

`SearchCode` is a grep-style search returning file, line, and snippet, capped at 50 results. It is the tool for "where is this used". It is also the reason `ReadFile` accepts ranges, so the follow-up read stays small.

`EditFile` performs a `str_replace` edit: the old string must appear exactly once or the edit is refused. That strictness is deliberate: an ambiguous match means the agent is working from a stale read, and the refusal tells it to re-read the file and try again.

`WriteFile` creates a new file, and refuses when the path already exists. Creation and modification are separate tools so the agent cannot accidentally overwrite by meaning to create.

## Execution

`RunCake` runs `bin/cake` console commands in a subprocess, allowlist-gated by `cake_allowlist` for the current environment, with `cake_destructive` entries requiring interactive confirmation. Commands that generate files return the created file's contents, so the next edit needs no read. Failures report stdout as well as stderr, because CakePHP prints most errors there. This is the CakePHP answer to the upstream `RunArtisan` tool with the same role, `bin/cake` instead of `artisan`.

`RunTests` runs your Pest suite in a subprocess and returns a structured summary: pass/fail counts and, per failure, the test name, `file:line`, and assertion, not the raw log. The agent reads failures and attempts the fix; when it gets stuck, paste the meaning of the failure as your next message. It respects the allowlist: when `test` is not in `cake_allowlist` for the environment, the tool is refused.

`RunPhpstan` runs PHPStan static analysis and returns the findings, accepting an optional path and level override, and no-ops gracefully when `vendor/bin/phpstan` is not present. `RunCodingStyle` runs the codesniffer to format files and is called before finishing a task. These are the CakePHP answers to the upstream `RunLarastan` / `RunPint` tools with the same roles, PHPStan and phpcs instead of Larastan and Pint.

`RunShell` is the general shell, governed by the `shell` config mode (`off`, `allowlist`, `approve`, `yolo`). In `allowlist` mode only first-token matches in `shell_allowlist` run; `approve` prompts every time.

`RunComposer` is Composer with the dangerous parts fenced off: a fixed set of read-only and mutating subcommands, mutations always `--no-scripts`, lifecycle scripts re-enabled only by a human at the terminal. Used by `coder upgrade`, where the whole lockfile dance happens through this tool.

`ReadPackageDocs` reads an installed package's upgrade guide, changelog, or `composer.json` from `vendor/`: a docs-only carve-out of the `vendor/*` protected path, because package code stays unreadable but the agent needs the upgrade guide. Used by `coder upgrade` in its plan step.

## Database and routes

`QueryDatabase` runs a read-only `SELECT` query and returns results as JSON, capped at 100 rows. Anything that is not a `SELECT` is refused in PHP. Read-only is not a configuration choice. It runs against the live connection through CakePHP's connection layer.

`MutateDatabase` is the one guarded write: a single `UPDATE`, `INSERT`, or `DELETE`, run inside a transaction that is committed only once a human has confirmed the exact affected-row count. Off by default (`Panifex.database.mutations`, locked to `local` environments, 100-row ceiling). Full rules in [Safety](./safety.md#database-writes). With no interactive user (`coder run`, the healer, MCP) there is nobody to confirm, so the change rolls back; `coder run --yes` approves automatically, which is a deliberate choice to make about unattended data changes.

`DescribeTables` is the application-map detail tool: real columns and types off the live connection, casts, finders, behaviors, associations, and validation for one table, or the full index with no argument. This is the CakePHP answer to the upstream `DescribeModels` tool with the same role, tables and entities instead of Eloquent models. `DescribeSchema` returns the raw schema instead: tables, columns, types, indexes, and foreign keys, authoritative because it comes from the live connection rather than guessed from migrations.

`ListRoutes` lists registered routes with method, URI, name, and action. One filter matches across all three, with a method narrow. It boots a fresh process, so routes the agent wrote moments ago are visible. `DescribeRoute` answers what happens on one route: the middleware stack with groups and aliases expanded, route bindings, validation rules, and the authorization guarding it. `ListRoutes` answers what exists; `DescribeRoute` answers what happens.

`AppInfo` reports the application stack: CakePHP and PHP versions and notable installed packages, so the agent (and your bug reports) start from facts. `GitDiff` shows a diff: staged, a specific commit, a branch range, or a path. `ReadLog` returns the last lines of the application log, with an optional filter string.

## Hosting and issues

`ReadSentryIssue` fetches a Sentry issue by ID: exception, stacktrace, breadcrumbs, and request context, or lists recent unresolved issues for the configured project when no ID is given. No-ops gracefully without `SENTRY_AUTH_TOKEN` / `SENTRY_ORG`.

`ReadSpeculumEntry` reads Speculum entries: exception records captured in your app's knowledge store. Pass a job UUID for a specific lookup, or omit it to return recent exceptions. No-ops gracefully when Speculum is not installed. This is the CakePHP answer to the upstream `ReadTelescopeEntry` tool with the same role, Speculum instead of Telescope.

`ReadIssue` fetches a tracker issue by number: title, body, labels, and all comments, through the unified issue tracker (GitHub, GitLab, or Redmine, resolved per remote by the locator). Omit the number to list recent open issues. `CreateIssue` opens a new issue with a title and body; `AddIssueComment` comments on one. These three replace the upstream `ReadGitHubIssue` / `CreateGitHubIssue` pair with the same roles, every tracker instead of GitHub-only. Issue bodies and comments are untrusted input; treat them that way.

`ReadPullRequest` fetches a pull (or merge) request by number: title, body, branch name, base branch, state, author, and comments. Use this (not `ReadIssue`) when the user references a PR number, especially when the branch name is needed for `CommitAndPush`. `CreatePullRequest` creates a branch, commits all worktree changes, pushes to origin, and opens the pull request, running the red-green proof first when the change adds tests, and reporting it in the PR body. `CommitAndPush` stages all changes, fetches the remote branch tip, rebases onto it, commits, and pushes via `HEAD:branch` without checking out the branch, for follow-up commits to an existing PR from a worktree session. Always pass the branch (get it from `ReadPullRequest`).

## Interaction and delegation

`AskUser` presents a select or multiselect prompt and returns the choice. `ConfirmAction` presents a confirm prompt before a destructive or irreversible operation and returns `confirmed` or `cancelled`. Both are interactive sessions only and never exposed to headless runs. Every other guard (destructive `RunCake`, `RunShell` under approve, `CommitAndPush`, `MutateDatabase`) auto-denies without a terminal unless `--yes` is passed.

`Delegate` runs a self-contained task in a subagent: a separate agent with its own fresh context and narrower toolset, and returns only its final report. Present only when `Panifex.subagents` is non-empty. See [Extending](./extending.md) for the subagent contract.

`ShieldedTool` and `EventedTool` are wrappers, not standalone tools: the first runs a tool behind the guard pack, the second dispatches the tool lifecycle events around it. They are how the safety layer and the observability layer attach to every tool call without each tool implementing them.

Want to add your own? See [Extending](./extending.md).

## Next steps

- [Headless runs](./sessions-run.md) — the agents behind the tool calls
- [Extending](./extending.md) — custom tools, subagents, hooks, events
- [Safety](./safety.md) — the safety layer in front of every tool above
