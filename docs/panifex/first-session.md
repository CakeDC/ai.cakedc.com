---
title: Panifex first session
description: 'coder code in depth: shell flags, worktrees, plan mode, slash commands, images.'
---

# First session

```bash
bin/cake coder code
```

`coder code` is the interactive coding agent: a REPL in your terminal that reads your codebase, edits files, runs tests, and formats code, keeping full conversation history within the session. New here? The tips at the bottom save a session or two of learning curve.

For CI, cron, or anything without a terminal, use [`coder run`](./sessions-run.md): the same agent, run once, with a structured result and an exit code.

## Example session

```text
Panifex Coder session started (model claude-sonnet-4-6, budget $1.00, shell approve)

What should I work on?
Add a slug field to the Articles table

  searching for Articles table
  reading src/Model/Table/ArticlesTable.php
  creating config/Migrations/20240101_AddSlugToArticles.php
  File saved
  editing src/Model/Table/ArticlesTable.php
  File saved
  running tests
  Done

Migration created, validation updated, and all tests pass.
ArticlesTable.php changed, 1 migration file added.
```

## Shell mode flag

`--shell` overrides the configured [shell mode](./configuration.md) for one session without touching config or env (verified in `src/Command/CodeCommand.php`):

```bash
bin/cake coder code --shell=off    # read-only exploration, nothing executes
bin/cake coder code --off          # shorthand
bin/cake coder code --shell=approve
bin/cake coder code --approve      # shorthand
bin/cake coder code --shell=allowlist
bin/cake coder code --allowlist    # shorthand
bin/cake coder code --shell=yolo   # no restrictions, no prompts — trusted only
bin/cake coder code --yolo         # shorthand
```

The flag is session-scoped and never persists to config.

## Worktree mode

Worktree mode runs the agent against an isolated git worktree instead of your live files. All edits land in a temp directory; nothing touches your working tree until you open a PR.

```bash
bin/cake coder code --worktree      # force on for this session
bin/cake coder code --no-worktree   # force off for this session
```

When active, the intro line shows worktree state and the diff summary is labelled so it is clear live files are untouched. Production environments default to worktree on (see [Configuration](./configuration.md)). Worktrees are cleaned up when the session ends; `bin/cake coder prune` removes leftovers from interrupted sessions.

## Plan mode

Have the agent think before it touches anything. In plan mode a read-only planning agent investigates the codebase and streams a numbered implementation plan: files, changes, risks. Nothing is edited until you approve it.

```bash
bin/cake coder code --plan     # every task plans first
```

Or plan a single task from inside the REPL:

```text
/plan add soft deletes to the Articles table
```

After the plan streams you choose: **Execute** (the coding agent follows the approved plan), **Revise** (describe what to change; the planner tries again), or **Cancel**. One approval replaces a session of per-edit vigilance.

## Slash commands

The prompt understands commands (verified in `src/Command/CodeCommand.php`, `BUILT_INS`). Type `/` to autocomplete them:

| Command | What it does |
|---|---|
| `/plan TASK` | Plan first, edit only after your approval |
| `/model` | Switch the model mid-session — no name shows a picker with known models and per-MTok rates; `/model provider model` switches provider too, budget rates update for known models |
| `/compact` | Summarize older session history to free context |
| `/clear` | Forget the session history entirely |
| `/sessions` | List saved sessions and how to resume them |
| `/raw` | Toggle markdown tables between drawn and literal |
| `/save NAME` | Save your last prompt as a project command |
| `/edit` | Open a project command in EDITOR |
| `/forget NAME` | Delete a project command |
| `/help` | List all commands, including your project's own |
| `/NAME args` | Run a project command from `.panifex/commands` |

## Rendered tables

When the agent answers with a markdown table (users, comparisons, findings), the terminal draws it as a table instead of printing pipes. Only the table's own lines are held back; every other line streams the moment its first character proves it is not a table row. Tables inside fenced code blocks stay verbatim, and a run of pipes with no separator row prints as-is rather than being reshaped.

The transcript always keeps the original markdown; this is presentation only. `/raw` toggles it off for the session when you want the markdown itself, or set `PANIFEX_RENDER_TABLES=false` to default it off.

## Project commands (.panifex/commands)

Reusable prompts your whole team shares, checked into the repo (verified in `src/Support/CustomCommands.php`, `.panifex/commands/*.md` under the workspace root). Drop a markdown file in and its name becomes a command:

```markdown
<!-- .panifex/commands/deploy-check.md -->
Review everything changed since the last tag for deploy risk: migrations that
lock tables, config that needs new env vars, breaking API changes. Focus on: $ARGUMENTS
```

```text
/deploy-check the billing module
```

`$ARGUMENTS` is replaced with whatever follows the command name (or arguments are appended when the template has no placeholder). Project commands work headlessly too: `bin/cake coder run "/deploy-check the billing module"`.

Manage them without leaving the session: `CustomCommands` reads the directory on every lookup, so a file written a second ago is live on the next keystroke, including tab completion:

| Command | What it does |
|---|---|
| `/save NAME` | Writes your last prompt, verbatim, to `.panifex/commands/NAME.md` |
| `/edit` | Opens it in EDITOR (or edits in-session when unset — prefilled text, Ctrl+D to save; never drops you into an editor you cannot exit) |
| `/forget NAME` | Deletes it, telling you whether git still has a copy first |

`/save` refuses names that collide with a built-in, confirms before overwriting, and leaves the file uncommitted. Your team gets the command when you commit it, and you read the diff first. To parameterise, `/edit` the file and put `$ARGUMENTS` where the substitution goes.

## Context compaction

Long sessions re-send their whole history every turn. Slower, costlier, eventually past the limit. When the conversation exceeds `PANIFEX_COMPACTION_THRESHOLD` (default 60000 chars), Panifex summarizes older exchanges and keeps the last `PANIFEX_COMPACTION_KEEP` messages verbatim, automatically. `/compact` forces it; `/clear` starts fresh. Applies to resumed sessions too.

## Images

Drag an image into the terminal (which pastes its path), type the path, or attach a workspace file. Panifex detects it, attaches it to the prompt, and the model sees the actual pixels:

```text
the header is misaligned, see /Users/me/Desktop/screen.png — fix the CSS
build this component from docs/mock.webp
```

PNG, JPEG, GIF, and WebP are recognized; quoted paths and escaped spaces from drag-and-drop both work. Requires a vision-capable model (the default Claude models are; some local models are not). Attachments belong to the turn they are sent with. They are not persisted across session resumes.

## Interactive UX

`coder code` uses `crustum/prompts` throughout for a fully interactive terminal experience: the task prompt shows previous tasks as autocomplete suggestions; streaming text appends without redrawing earlier output; the terminal tab title tracks agent state ("Thinking", "Reading files", "Running tests"); `AskUser` renders as a styled selection list; `ConfirmAction` as a styled yes/no prompt; a bounded git summary shows only when the tracked diff changes during the turn (at most 10 paths, staged and earlier edits included; untracked files excluded); a styled warning appears near 80% of session budget; session start and end show banners with model, budget, and shell mode. A single Ctrl+C stops cleanly between steps instead of killing the process mid-turn.

## Tips for better results

**Be specific about what you want.** Vague tasks produce vague results.

| Instead of | Try |
|---|---|
| "Add a feature" | "Add a `published_at` timestamp to `Articles` with a finder for published rows and a migration" |
| "Fix the bug" | "The `ArticlesController::view` returns 500 when `slug` is null — find out why and fix it" |
| "Refactor this" | "The `BillingService` class does too much — extract the payment logic into a `PaymentService`" |

**Use `--off` for questions and exploration.** `--shell=off` prevents any command from running, so you can ask freely: "How is authentication wired in this app?", "What does the queue setup look like?"

**Point it at the right place.** "Look at `src/Service/BillingService.php`" is faster than letting it search from scratch.

**Correct it mid-session.** If the agent does something wrong, say so in the next prompt. It reads your correction in context and adjusts. No restart needed.

**Keep tasks focused.** One clear task per session beats a list. Review the diff, commit, then start the next task.

**Review before you move on.** After each task the agent shows a diff stat. Look at it before typing the next task; if something looks wrong, say so or discard with `git checkout -- .`.

## Next steps

- [Project setup](./project-setup.md) — PANIFEX.md, session memory, application map
- [Headless runs](./sessions-run.md) — the same agent for CI and cron
- [Configuration](./configuration.md) — every knob behind the flags above
