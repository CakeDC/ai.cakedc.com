---
title: Panifex project setup
description: PANIFEX.md instructions, session memory, and the CakePHP application map.
---

# Project setup

Three things that make every session smarter: project instructions the agent loads automatically, transcripts that resume, and the application map that answers schema questions without reading files.

## Project instructions (PANIFEX.md)

Every Panifex agent (`coder code`, `coder fix`, `coder review`, `coder explain`, `coder test`, `coder upgrade`, and the self-healer) loads a `PANIFEX.md` file from your project root at the start of each session and follows it. Record conventions, boundaries, and gotchas once instead of repeating them in every prompt.

Generate a starter file (verified in `src/Command/InitCommand.php`, `coder init`):

```bash
bin/cake coder init
bin/cake coder init --force   # overwrite an existing file
```

It scans your project (composer.json, test framework, codesniffer/phpstan presence, `src/` structure) and scaffolds `Conventions`, `Boundaries`, and `Gotchas` sections for you to fill in.

Example content:

```markdown
## Conventions

- All money values are integer cents — never floats.
- New endpoints validate through validation classes, never inline.

## Boundaries

- Never modify files under `src/Legacy/` — scheduled for deletion.
- Do not add new composer dependencies without asking first.

## Gotchas

- `Articles::find('published')` excludes soft-deleted AND suspended rows.
```

Notes:

- With no `PANIFEX.md`, Panifex falls back to `AGENTS.md`, then `CLAUDE.md`. Instructions you already maintain for other AI tools work out of the box. Files written for a different harness are handled gracefully: the agent is told to ignore instructions naming tools it does not have (an MCP tool, a skill to activate) while still following conventions, house style, and project facts.
- Content is capped at 20,000 characters to protect your context window and session budget; anything beyond that is truncated.
- Project instructions never override the [safety layer](./safety.md): protected paths, shell modes, and allowlists are enforced in PHP regardless of what the file says.

## Session memory

`Panifex.memory` (`PANIFEX_MEMORY`, `file` or `none`) controls what happens to conversation history when you exit (verified in `src/Support/SessionStore.php`; transcripts are JSON files, one per session, with a `.gitignore` written alongside so history never lands in your repository):

| Mode | Behaviour |
|---|---|
| `file` | Default. The transcript is saved after every turn. Re-running `coder code` resumes where you left off |
| `none` | History is lost when the session ends. Every run starts fresh |

With `file` mode you will see this on your next run:

```text
Resumed session 'default' — 12 messages of history. Type /clear to start fresh.
```

Named sessions keep separate histories for separate streams of work:

```bash
bin/cake coder code --session=billing-refactor
bin/cake coder code --session=bugfixes
```

`coder run` joins a persisted session only when `--session` is passed. Anonymous one-shot runs never pollute your interactive history. A cron `coder run --session=nightly` accumulates context across nights.

Notes:

- Transcripts are JSON: delete a file (or `/clear` in the REPL) to forget a session; the storage directory is gitignored automatically to keep history out of your repository.
- Context compaction applies to resumed sessions too: a long transcript is summarized before it eats your context window.
- Image attachments are not persisted: re-attach an image if a later session needs it.
- Text is persisted, not tool output: a resumed session remembers what was said and done, and the agent re-reads files as needed.

## The application map

Every other coding agent reads your files. Panifex runs inside your booted CakePHP application, so it can ask the framework directly: what columns does this table actually have, what does this finder do, which middleware really runs on this route, what does the validation allow.

The application map is that question, packaged (verified in `src/Support/AppMap.php`, surfaced by `src/Tool/DescribeTables.php` and `src/Tool/DescribeRoute.php`). It replaces a pile of `ReadFile` calls over tables and migrations with one tool call that is cheaper and more likely to be right. Because a migration file tells you what someone intended in 2023, and the live connection tells you what is there now.

Two tiers. Tier one is an index injected into the system prompt of every session: table names and a route count, around sixty tokens, removing the most expensive failure mode there is: an agent spending four tool calls globbing `src/Model` to discover the domain.

Tier two is detail on demand, through two tools the agent calls when it actually needs the shape of something. `DescribeTables` returns real columns and types from the live connection, casts, finders, behaviors, associations, and validation for one table (called with no argument it lists every table). `DescribeRoute` answers what happens on one route: the middleware stack with groups expanded, bindings, validation rules, and authorization. `ListRoutes` answers what exists; `DescribeRoute` answers what happens. Validation is best-effort by design: rules that depend on the request cannot be evaluated outside a request cycle, so the map returns the method source verbatim with a note saying so. Still cheaper than reading the whole file, and honest about being unresolved.

Where it pays off: `coder code` stops hallucinating column names; `coder test` stops guessing at factory states and column values (the most common reason a generated test fails on first run); `coder review` can tell an N+1 from a legitimate lazy load; the healer resolves "Unknown column" in one tool call instead of four.

Three boundaries, all deliberate. It returns schema and metadata, never rows. `QueryDatabase` is the tool for data with its own read-only caps; keeping that line clean is what makes the map safe to leave enabled in every environment. It never invokes a method to see what comes back. Behavior comes from declared signatures and associations, not from executing your code. It degrades out loud: the column list needs a live connection, which a worktree or a pre-migrate checkout may not have. Then the map says so and returns the reflection half, because half a map presented as complete is worse than nothing.

Staleness: the map is cached (`Panifex.app_map.cache`), keyed on a fingerprint of your table, migration, and route files. It is flushed when a migration finishes and when the agent's own edits touch a table or migration — a change made mid-session is visible on the agent's very next call. One limitation worth knowing: reflection reads the classes loaded into the running process, so in a worktree the map describes the booted application's classes, not the worktree's copies. The schema half stays exact either way.

The same machinery, for humans: `bin/cake coder map` (verified in `src/Command/MapCommand.php`: `table` argument, `--route`, `--all`, `--plain`, `--fresh`):

```bash
bin/cake coder map                  # the index: every table
bin/cake coder map Articles         # one table, in full
bin/cake coder map --all            # every table, in full
bin/cake coder map --route=articles.view  # one route: middleware, rules, authorization
bin/cake coder map --plain          # exactly what the agent sees, uncoloured
bin/cake coder map --fresh          # discard the cached map and rebuild
```

Terminal output is colour-coded for scanning while the agent gets plain text; `--plain` prints the agent's version when you want to see precisely what it received. Useful for warming the cache in CI, and for seeing exactly what your agent sees before blaming it for a wrong column name.

```php
// config/panifex.php
'app_map' => [
    'enabled' => env('PANIFEX_APP_MAP', true),
    'index' => env('PANIFEX_APP_MAP_INDEX', true),
    'cache' => env('PANIFEX_APP_MAP_CACHE', true),
],
```

## Next steps

- [First session](./first-session.md) — the interactive agent in depth
- [Headless runs](./sessions-run.md) — the same agent for CI and cron
- [Configuration](./configuration.md) — every `Panifex.*` key
