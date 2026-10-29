---
title: Panifex focused sessions
description: 'coder fix, explain, test, onboard: one task, one agent, no wandering.'
---

# Focused sessions

Four commands for one task each, all sharing the flags of [`coder code`](./first-session.md) and [`coder run`](./sessions-run.md) where they apply. Options verified in `src/Command/FixCommand.php`, `ExplainCommand.php`, `TestCommand.php`, and `OnboardCommand.php`.

## Fix an issue

```bash
# Paste or describe the exception at the prompt
bin/cake coder fix

# Load context from a Sentry issue
bin/cake coder fix --sentry=4821

# Load context from a tracker issue
bin/cake coder fix --issue=42
```

`coder fix` opens a focused fix session. It loads context from a Sentry issue, a tracker issue (GitHub, GitLab, or Redmine via the unified issue tracker), or a pasted exception. Then it fires the agent immediately, without you having to describe the task. Worktree mode is on by default so live files are never touched until you open a PR.

After the agent applies the fix, the session stays open for follow-up:

```text
add a regression test for this
open a pull request
exit
```

All shell and worktree flags from `coder code` are supported:

```bash
bin/cake coder fix --sentry=4821 --no-worktree   # edit live files directly
bin/cake coder fix --issue=42 --yolo              # skip shell approval prompts
```

Setup for issue sources: `--sentry=ID` requires the [Sentry integration](./connections-hosting.md) (`SENTRY_AUTH_TOKEN` + `SENTRY_ORG`); `--issue=N` requires a [tracker integration](./connections-hosting.md) (`GITHUB_TOKEN` + repo, or Redmine host + project).

Exception messages, issue bodies, and comments are text an attacker can influence, and they reach an agent running as you. Read what the guards do and do not stop in [Safety](./safety.md) before wiring `coder fix` to untrusted sources, and consider running it in CI with throwaway credentials.

## Explain code

```bash
# Explain a whole file
bin/cake coder explain src/Service/BillingService.php

# Focus on a specific method
bin/cake coder explain src/Service/BillingService.php --method=charge
```

`coder explain` (`ExplainAgent`) reads a file or class and explains what it does in plain English: inputs, outputs, side effects, and any non-obvious behaviour. The agent reads the full file and any closely-related classes before responding. Read-only; nothing is edited.

## Generate tests

```bash
# Generate tests for a class
bin/cake coder test src/Service/BillingService.php

# Focus on a single method
bin/cake coder test src/Service/BillingService.php --method=charge

# Force a feature or integration test
bin/cake coder test src/Controller/ArticlesController.php --feature

# Force a unit test
bin/cake coder test src/Service/BillingService.php --unit
```

`coder test` (`TestWriterAgent`) reads a class, checks your existing test conventions, and writes a Pest test file covering the happy path, edge cases, and error conditions. It runs the tests after writing to confirm they pass.

Test type is inferred from the path when no flag is given: controllers, jobs, commands, listeners, and middleware default to feature-style; everything else defaults to unit. Inside a coding session the main agent can also delegate test writing to the `test-writer` subagent mid-session, keeping the main conversation focused.

## Onboard a developer

```bash
# The full tour, then a Q and A prompt
bin/cake coder onboard

# Tour one area in depth — a directory, module, or domain concept
bin/cake coder onboard --focus=src/Billing
bin/cake coder onboard --focus="checkout"

# Skip the tour and go straight to questions
bin/cake coder onboard --ask

# Save the tour as docs/ONBOARDING.md (or a path of your choice)
bin/cake coder onboard --write
bin/cake coder onboard --write=docs/architecture/TOUR.md
```

`coder onboard` (`OnboardingAgent`) gives a new developer the first-day tour a senior teammate would: read-only, built from what is actually in the repository, with file paths throughout so they can open what it describes. Then it stays open to answer questions about the codebase. Options verified: `--focus`, `--write`, `--ask`, plus `--model` / `--provider`.

The tour works through a fixed set of sections, each built from evidence in the repo (never from framework defaults) and cites the files it describes:

1. What this app is: the product or purpose and the core domain nouns.
2. How it is put together: the layout and architectural pattern actually in use, the load-bearing packages, and how a request flows for the two or three most important routes.
3. Entrypoints: key routes, console commands, queued jobs, scheduled tasks, events and listeners, webhooks, and the class that handles each.
4. Data model: the core tables, how they relate, and anything unusual in the migrations.
5. Running it locally: setup from `.env.example`, composer scripts, test suite, asset builds.
6. Conventions: as observed, with an example file each: test style, codesniffer preset, static analysis level, validation style, enums, how auth is wired.
7. Where to be careful: files that change most, skipped or missing tests, deprecations and TODO clusters, anything the team's own instructions flag, integrations that need credentials.
8. Good first tasks: a few small, low-risk places to start.

Sections with nothing to say get one honest line ("no scheduler") rather than filler. After the tour, the prompt stays open: "where is the refund logic?", "how does API auth work?". Answered from the code, with the same citations.

Keeping the document fresh: `--write` works without a terminal, so the onboarding doc can be regenerated by the scheduler or CI instead of rotting. If the provider cuts the stream short (a mid-stream error, or the output length limit), nothing is written and the command exits non-zero. A scheduled run never replaces a complete document with a partial one. The file opens with a comment naming the command that generated it; `--write` must point inside the project at a `.md` file.

How it behaves: read-only. The agent has file, glob, search, and route tools plus `Delegate` to the `explorer` subagent when registered, so broad sweeps happen in a subagent and the main conversation stays clean for questions. It never edits files or runs shell commands. No suggestions: anything risky is described as a place to be careful, not a task — use `coder review` or `coder code` when you want changes. Your instructions are the source of truth: it reads `PANIFEX.md` (or `AGENTS.md` / `CLAUDE.md`) and quotes the team's conventions rather than restating them. `--focus` stays in its lane. Budget and model flags work as elsewhere.

`coder explain` explains a single file, class, or method. `coder onboard` is the whole-application version, with a narrative and a prompt that stays open for questions.

## Next steps

- [First session](./first-session.md) — the interactive agent these build on
- [Review](./review.md) — the other read-only specialist
- [Hosting connections](./connections-hosting.md) — tracker and Sentry setup behind --issue and --sentry
