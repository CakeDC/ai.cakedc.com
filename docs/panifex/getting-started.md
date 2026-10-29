---
title: Panifex getting started
description: Install Panifex, configure providers and budgets, run your first session.
---

# Getting started

Install, configure, and run your first `coder` session. Names verified in `src/Command/*Command.php::defaultName()` and `config/panifex.php`.

## Install

Requirements: PHP `>=8.2`, CakePHP `^5.4`.

```bash
composer require crustum/panifex
bin/cake plugin load Crustum/Panifex
```

No `vendor:publish` step. Configuration lives in `config/panifex.php` (`Panifex.*`, every value has a `PANIFEX_*` env override).

## Provider and model

Anthropic (Claude) by default:

```env
ANTHROPIC_API_KEY=sk-ant-...
PANIFEX_PROVIDER=anthropic
PANIFEX_MODEL=claude-sonnet-4-6
```

Any provider in `crustum/cakephp-ai` works. Unknown models need explicit rates so the budget stays meaningful (local example, zero cost):

```env
PANIFEX_PROVIDER=ollama
PANIFEX_MODEL=qwen3-coder
PANIFEX_PRICE_INPUT=0
PANIFEX_PRICE_OUTPUT=0
```

Extra models go under `Panifex.pricing.models` (`config/panifex.php`). Switch per session with `coder code --model=... [--provider=...]`, or mid-session with `/model`.

## Verify

```bash
bin/cake coder health
bin/cake coder health --probe-provider
```

Checks config, API key, git repo state, and integration wiring. `--probe-provider` makes one minimal live model request. Before changing environments, commit or stash work. The agent edits files and clean git is the undo button.

## First session

```bash
bin/cake coder code
```

Type a task, follow up naturally, `exit` to end. Be specific ("add `published_at` to `Articles` with a finder and migration", not "add a feature"). Review with `git diff` after each task.

Read-only exploration: `bin/cake coder code --shell=off` (nothing executes). Worktree isolation: `--worktree` / `--no-worktree` (production defaults on; clean up with `bin/cake coder prune`). Plan-first: `--plan` or `/plan <task>` (read-only plan, then Execute / Revise / Cancel).

Headless (CI/cron, no terminal): `bin/cake coder run "task" --output=json`. Same agent and safety layer, one run, JSON + exit code (`0` ok, `1` error, `2` budget, `3` denied, `4` steps).

## Project instructions and memory

Every agent loads `PANIFEX.md` from the project root (falls back to `AGENTS.md`, then `CLAUDE.md`, ignoring tool names it doesn't have). Scaffold one with `bin/cake coder init` (`--force` to overwrite): conventions, boundaries, gotchas. Capped at 20,000 chars; never overrides the safety layer.

`Panifex.memory` (`PANIFEX_MEMORY`, `file` | `none`): `file` (default) resumes the transcript on the next run (`--session=name` keeps separate histories; `--session` on `coder run` joins one, otherwise runs stay anonymous). Transcripts are JSON; `/clear` forgets, `/compact` summarizes, `/sessions` lists.

## Application map

The agent runs inside the booted app, so it asks the framework instead of guessing from files. Tier one is an index in every system prompt (one line per table + route count); detail comes on demand via `DescribeTables` / `DescribeRoute` / `bin/cake coder map`:

```bash
bin/cake coder map                  # index
bin/cake coder map Articles         # one table in full
bin/cake coder map --all            # everything
bin/cake coder map --route=articles.view  # middleware, bindings, rules, auth
bin/cake coder map --fresh          # rebuild cache
```

Real columns/types off the live connection, casts, finders, behaviors, routes with expanded middleware. Schema and metadata only, never rows. `Panifex.app_map` (`enabled` / `index` / `cache`) stays on in every environment.

## Configuration essentials

`Panifex.shell` (per `APP_ENV`, production `off`): `off` | `allowlist` | `approve` (default) | `yolo`. `shell_allowlist` (`composer`, `npm`, `bin/cake`). `RunCake` also needs `cake_allowlist` (`bake`, `migrations`, `seeds`, `cache`, `routes`, `test` locally) and `cake_destructive` entries always confirm. Budgets: `budget_usd` (`PANIFEX_BUDGET`, `1.00`), `max_steps` (`PANIFEX_MAX_STEPS`, `40`, a ceiling under each agent's own attribute). Context: `max_tool_result_chars` (48000), `max_context_chars` (600000). Prompt cache (Anthropic, on by default) covers prefix and conversation tail.

## Next steps

- [First session](./first-session.md) — the interactive agent in depth
- [Tools](./tools.md) — the 35 built-in tools and extending them
- [Reference](./reference.md) — troubleshooting and limits
