---
title: Panifex configuration
description: 'Every Panifex.* key: shell, CakePHP gates, budgets, worktrees, healing, transports.'
---

# Configuration

All values live under `Panifex.*` in `config/panifex.php` (`Configure::read('Panifex.*')`), each with a `PANIFEX_*` env override. Full key reference. Nothing requires editing PHP, but every knob is documented here so `coder` sessions behave predictably.

## Provider, model, steps, budget

```php
'provider' => env('PANIFEX_PROVIDER', 'anthropic'),
'model' => env('PANIFEX_MODEL', 'claude-sonnet-4-6'),
'max_steps' => env('PANIFEX_MAX_STEPS', 40),
'budget_usd' => env('PANIFEX_BUDGET', 1.00),
```

`provider` must match a key in `crustum/cakephp-ai` config. `max_steps` is a ceiling, not a grant: each agent declares its own `#[MaxSteps]` attribute which cannot be raised at runtime. Setting this higher has no effect above it. `budget_usd` is a hard per-session spend cap; the run aborts past it. Per-run overrides: `coder run --budget=0.50 --max-steps=25`. Upstream `AI_CODE_*` names do not exist here; every key is `PANIFEX_*`.

## Prompt cache and tool scoping

```php
'prompt_cache' => env('PANIFEX_PROMPT_CACHE', true),
'tools' => null, // e.g. ['ReadFile', 'EditFile', 'WriteFile', 'Glob', 'SearchCode', 'RunTests']
```

Anthropic-only, on by default: `cache_control` breakpoints on the fixed prefix (system prompt + tool schemas) and on the conversation tail, the half that actually grows, since every file read and test result is otherwise re-sent at full price each step. Repeat reads bill ~10%; a cache write bills 1.25×, repaid on the first re-read. `PANIFEX_PROMPT_CACHE=false` disables it; measure with `coder eval --no-cache`. No-op for non-Anthropic providers. Budget tracking is cache-aware.

`tools` restricts the agent toolset to class base names. Integration tools are lazy regardless: tracker tools appear only with tracker credentials, `ReadSentryIssue` only with `Panifex.sentry.auth_token`, `ReadSpeculumEntry` only when Speculum is installed. Measure any toolset with `coder eval --agent`.

## Application map

```php
'app_map' => [
    'enabled' => env('PANIFEX_APP_MAP', true),
    'index' => env('PANIFEX_APP_MAP_INDEX', true),
    'cache' => env('PANIFEX_APP_MAP_CACHE', true),
],
```

One-line-per-table index in every system prompt; detail via `DescribeTables` / `DescribeRoute` / `bin/cake coder map`. Read-only (schema + metadata, never rows). See [Getting started](./getting-started.md#application-map).

## Tables and rendering

```php
'render_tables' => env('PANIFEX_RENDER_TABLES', true),
```

Markdown tables in answers draw as terminal tables; the transcript keeps markdown. Toggle per session with `/raw`.

## Database writes

```php
'database' => [
    'mutations' => env('PANIFEX_DB_MUTATIONS', false),
    'environments' => ['local'],
    'max_rows' => env('PANIFEX_DB_MUTATION_MAX_ROWS', 100),
],
```

Off by default with a second lock: the flag alone cannot arm production. One `UPDATE`/`INSERT`/`DELETE` per call, `WHERE` required, transaction committed only after a human confirms the exact row count; over-limit rolls back. Full rules in [Safety](./safety.md#database-writes).

## Red-green proof

```php
'verify' => ['red_green' => env('PANIFEX_VERIFY_RED_GREEN', true)],
```

Before `CreatePullRequest` opens a PR that adds tests, it runs them twice (with the change (must pass) and reverted (must fail)) and reports both in the PR body. Best-effort, never blocking. `false` disables.

## Pricing

```php
'pricing' => [
    'input_per_mtok' => env('PANIFEX_PRICE_INPUT'),
    'output_per_mtok' => env('PANIFEX_PRICE_OUTPUT'),
    'models' => [/* 'llama-3.3-70b' => ['input' => 0.0, 'output' => 0.0] */],
],
```

Unset = resolved from `ModelCatalog` (Anthropic + common OpenAI/Gemini/Grok snapshots, best-effort, verify when budgets matter). Pin explicit rates for unknown models; `0` for local. `/model` in a session lists known models with rates.

## Compaction

```php
'compaction' => [
    'threshold_chars' => env('PANIFEX_COMPACTION_THRESHOLD', 60000),
    'keep_recent' => env('PANIFEX_COMPACTION_KEEP', 4),
],
```

Past the threshold, older history is summarized and the last `keep_recent` messages kept verbatim. `/compact` forces it, `/clear` starts fresh. Applies to resumed sessions too.

## Shell and CakePHP gates

```php
'shell' => [
    'local' => env('PANIFEX_SHELL', 'approve'),
    'staging' => env('PANIFEX_SHELL', 'approve'),
    'production' => env('PANIFEX_SHELL', 'off'),
],
'shell_allowlist' => ['composer', 'npm', 'bin/cake'],
'cake_allowlist' => [
    'local' => ['bake', 'migrations', 'seeds', 'cache', 'routes', 'test'],
    'staging' => ['migrations', 'seeds', 'routes'],
    'production' => ['routes'],
],
'cake_destructive' => [
    'local' => ['migrations migrate --drop-all', 'migrations rollback', 'migrations reset'],
    'staging' => [],
    'production' => [],
],
```

Modes: `off` (refuse everything; use `RunCake`/`RunTests`) | `allowlist` (first token must match `shell_allowlist`) | `approve` (default; every command prompts, "always allow" persists) | `yolo` (no prompts; trusted only). Per-session override: `coder code --shell=...`. A CakePHP command must satisfy both lists in `allowlist` mode; `cake_destructive` entries always need a terminal confirmation (refused headlessly unless `--yes`). Upstream `artisan_allowlist` / `artisan_destructive` do not exist. These are the CakePHP equivalents, enforced by `src/Tool/RunCake.php`.

## Paths and context guards

```php
'protected_paths' => ['.env', '.env.*', 'storage/*', 'vendor/*', '.git/*'],
'ignored_directories' => ['node_modules', '.git', 'vendor', 'storage', 'bootstrap/cache', 'webroot/build'],
'max_tool_result_chars' => env('PANIFEX_MAX_TOOL_RESULT_CHARS', 48000),
'max_context_chars' => env('PANIFEX_MAX_CONTEXT_CHARS', 600000),
'workspace' => null,
'memory' => env('PANIFEX_MEMORY', 'file'),
```

`protected_paths` block reads/writes in PHP regardless of prompting. Never weaken `.env`/`vendor/*`/`.git/*` lightly. `ignored_directories` is a relevance filter for recursive walks, not a security boundary. `workspace` (`null` = app root) restricts the agent further with an absolute path. `memory`: `file` resumes transcripts, `none` starts fresh.

## Evals

```php
'evals' => [
    'path' => env('PANIFEX_EVALS_PATH', ROOT . DS . 'evals'),
    'include_builtin' => env('PANIFEX_EVALS_INCLUDE_BUILTIN', true),
],
```

`coder eval` benchmarks the agent; user cases (ID match overrides builtins). See [Evals](./eval.md).

## Subagents

```php
'subagents' => [
    'explorer' => ['agent' => ExplorerAgent::class, 'description' => '...'],
    'test-writer' => ['agent' => TestWriterAgent::class, 'description' => '...'],
],
```

`Delegate` tool targets; `[]` removes it. See [Tools](./tools.md).

## Hooks

```php
'hooks' => [
    'pre_tool' => [/* ['match' => 'RunShell', 'run' => 'scripts/panifex/guard-shell.sh'] */],
    'post_tool' => [/* ['match' => ['EditFile', 'WriteFile'], 'run' => 'vendor/bin/phpcs ...'] */],
    'session_start' => [],
    'session_end' => [],
],
```

Deterministic policy around every tool run. See [Tools](./tools.md).

## Guard pack

```php
'guard' => [
    'secrets' => env('PANIFEX_GUARD_SECRETS', 'block'),
    'network' => env('PANIFEX_GUARD_NETWORK', 'block'),
    'composer_scripts' => env('PANIFEX_GUARD_COMPOSER', 'block'),
    'secret_patterns' => [],
    'injection_classifier' => [
        'enabled' => env('PANIFEX_GUARD_INJECTION', false),
        'provider' => env('PANIFEX_GUARD_INJECTION_PROVIDER'),
        'model' => env('PANIFEX_GUARD_INJECTION_MODEL'),
        'tools' => ['ReadSentryIssue', 'ReadIssue', 'ReadPullRequest'],
    ],
],
```

`network` also accepts `confirm`. Injection screening is experimental, off by default, fails open. See [Safety](./safety.md#injection-shield-experimental).

## VCS and credentials

```php
'vcs' => [
    'repo' => env('PANIFEX_VCS_REPO'),
    'provider' => env('PANIFEX_VCS_PROVIDER', 'github'),
    'github' => ['repo' => env('GITHUB_REPO')],
    'gitlab' => [['host' => env('PANIFEX_GITLAB_HOST', 'gitlab.com'), 'repo' => env('GITLAB_REPO')]],
],
'credentials' => [
    'github.com' => ['type' => 'github', 'token' => env('GITHUB_TOKEN')],
    'gitlab.com' => ['type' => 'gitlab', 'token' => env('GITLAB_TOKEN')],
],
'github' => ['repo' => env('GITHUB_REPO')],
```

One process can serve several GitLab hosts (single map or list; hosts appearing only in `credentials` still get a provider, repo resolved from the merge-request URL). Tokens live once per host in `credentials`; legacy per-section keys still resolve. See [Hosting connections](./connections-hosting.md).

## Issue tracker, Sentry, MCP

```php
'issue_tracker' => [
    'provider' => env('PANIFEX_ISSUE_TRACKER_PROVIDER', 'redmine'),
    'default_host' => env('PANIFEX_ISSUE_TRACKER_HOST'),
    'default_project' => env('REDMINE_PROJECT'),
    'redmine' => ['host' => env('REDMINE_HOST'), 'project' => env('REDMINE_PROJECT'), 'closed_status_id' => env('REDMINE_CLOSED_STATUS_ID', 5)],
    'github' => ['repo' => env('GITHUB_REPO')],
],
'sentry' => ['auth_token' => env('SENTRY_AUTH_TOKEN'), 'org' => env('SENTRY_ORG'), 'project' => env('SENTRY_PROJECT')],
'mcp' => ['tools' => [ReadFile::class, Glob::class, /* ... */ MutateDatabase::class]],
```

Redmine first, single map or list; GitHub issues served through the same abstraction. MCP defaults to read/inspect + analysis (16 tools); interactive tools never served. See [MCP server](./mcp-server.md).

## Healing

```php
'healing' => [
    'enabled' => env('PANIFEX_HEALING_ENABLED', false),
    'mode' => env('PANIFEX_HEALING_MODE', 'pr'),
    'model' => env('PANIFEX_HEALING_MODEL'),
    'provider' => env('PANIFEX_HEALING_PROVIDER'),
    'queue' => env('PANIFEX_HEALING_QUEUE', 'healer'),
    'threshold' => (int) env('PANIFEX_HEALING_THRESHOLD', 1),
    'branch_prefix' => env('PANIFEX_HEALING_BRANCH_PREFIX', 'panifex/heal-'),
    'base_branch' => env('PANIFEX_HEALING_BASE_BRANCH', 'main'),
    'github_token' => env('GITHUB_TOKEN', null),
    'speculum' => env('PANIFEX_HEALING_SPECULUM', true),
    'baseline' => env('PANIFEX_HEALING_BASELINE', true),
    'static_analysis' => env('PANIFEX_HEALING_STATIC_ANALYSIS', true),
    'max_files' => (int) env('PANIFEX_HEALING_MAX_FILES', 20),
    'max_diff_lines' => (int) env('PANIFEX_HEALING_MAX_DIFF_LINES', 400),
    'protected_from_healing' => ['config/Migrations/*', 'config/*', 'composer.json', 'composer.lock', '.env*'],
],
```

Unattended heals run on the `healer` queue. See [Self-healing](./healing.md).

## Chat transports

```php
'remote' => [
    'host' => env('PANIFEX_REMOTE_HOST', '0.0.0.0'),
    'advertise_host' => env('PANIFEX_REMOTE_ADVERTISE_HOST', ''),
    'port' => (int) env('PANIFEX_REMOTE_PORT', 8787),
    'public_url' => env('PANIFEX_REMOTE_PUBLIC_URL'),
    'storage_path' => env('PANIFEX_REMOTE_STORAGE', sys_get_temp_dir() . '/panifex-remote'),
    'session_lifetime' => (int) env('PANIFEX_REMOTE_SESSION_LIFETIME', 43200),
    'answer_timeout' => (int) env('PANIFEX_REMOTE_ANSWER_TIMEOUT', 600),
    'poll_interval_ms' => (int) env('PANIFEX_REMOTE_POLL_MS', 400),
],
'telegram' => [
    'token' => env('PANIFEX_TELEGRAM_TOKEN'),
    'allowed_chats' => array_values(array_filter(array_map('trim', explode(',', (string) env('PANIFEX_TELEGRAM_CHATS', ''))))),
    'poll_timeout' => (int) env('PANIFEX_TELEGRAM_POLL_TIMEOUT', 2),
    'debug' => env('PANIFEX_TELEGRAM_DEBUG', false),
],
'slack' => [
    'bot_token' => env('PANIFEX_SLACK_BOT_TOKEN'),
    'app_token' => env('PANIFEX_SLACK_APP_TOKEN'),
    'channel' => env('PANIFEX_SLACK_CHANNEL'),
    'allowed_users' => array_values(array_filter(array_map('trim', explode(',', (string) env('PANIFEX_SLACK_USERS', ''))))),
    'poll_timeout' => (int) env('PANIFEX_SLACK_POLL_TIMEOUT', 2),
    'debug' => env('PANIFEX_SLACK_DEBUG', false),
],
'rocketchat' => [
    'server_url' => env('PANIFEX_ROCKETCHAT_SERVER_URL'),
    'user_id' => env('PANIFEX_ROCKETCHAT_USER_ID'),
    'auth_token' => env('PANIFEX_ROCKETCHAT_AUTH_TOKEN'),
    'room' => env('PANIFEX_ROCKETCHAT_ROOM'),
    'allowed_users' => array_values(array_filter(array_map('trim', explode(',', (string)env('PANIFEX_ROCKETCHAT_USERS', ''))))),
    'poll_timeout' => (int) env('PANIFEX_ROCKETCHAT_POLL_TIMEOUT', 2),
    'edit_interval' => (float) env('PANIFEX_ROCKETCHAT_EDIT_INTERVAL', 3),
    'debug' => env('PANIFEX_ROCKETCHAT_DEBUG', false),
],
```

`host` is the bind interface (`0.0.0.0` = reachable on LAN; `127.0.0.1` for local only); `advertise_host` overrides QR pairing address detection; `public_url` serves pairing SVGs behind a reverse proxy. Transports reuse `remote.storage_path` + `remote.answer_timeout`. Every transport's allowlist is its whole security model. See [Chat connections](./connections-chat.md).

## Next steps

- [Getting started](./getting-started.md) — install and verify
- [First session](./first-session.md) — per-session flags
- [Safety](./safety.md) — guards and integrations in depth
