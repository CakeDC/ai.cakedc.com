---
title: Panifex
description: 'Autonomous coding agent for CakePHP: commands, agents, tools, safety.'
---

# Panifex

Panifex (`crustum/panifex`, `Crustum\Panifex`) is the autonomous coding-agent backend: it reads your CakePHP codebase, edits files, runs tests, reviews pull requests, upgrades dependencies, and heals failed jobs. Safety boundaries are enforced in PHP, not by prompting.

## Installation

```bash
composer require crustum/panifex
bin/cake plugin load Crustum/Panifex
```

Requirements: PHP `>=8.2`, CakePHP `^5.4`. Verify with `bin/cake coder health`.

## What it provides

- **Setup** — [Getting started](./getting-started.md) (install, verify, first session), [Configuration](./configuration.md) (every `Panifex.*` key), [First session](./first-session.md) (interactive agent in depth), [Project setup](./project-setup.md) (`PANIFEX.md`, memory, application map).
- **Sessions** — [Headless runs](./sessions-run.md) (`coder run` for CI), [Focused sessions](./sessions-focused.md) (fix, explain, test, onboard), [Code review](./review.md) (`coder review` plus `coder respond`), [Upgrades](./upgrade.md) (`coder upgrade`), [Evals](./eval.md) (`coder eval`), [Self-healing](./healing.md) (autonomous healer).
- **Tools and extending** — [Tools](./tools.md) (all 35), [Extending](./extending.md) (custom tools, agents, subagents, hooks, events, providers).
- **Safety and connections** — [Safety](./safety.md) (guards, database writes, injection shield), [Chat connections](./connections-chat.md) (remote, Telegram, Slack, Rocket.Chat), [Hosting connections](./connections-hosting.md) (GitHub and GitLab, Redmine, Sentry, CI), [MCP server](./mcp-server.md) (coding from any agent).
- **Reference** — [Reference](./reference.md) (every `PANIFEX_*` variable, utility commands, troubleshooting, limits).

Backend details live on their pages; generic harness concepts live under [Harness](/harness/).

## Next steps

- [Getting started](./getting-started.md) — install, verify, first session
- [Headless runs](./sessions-run.md) — the same agent for CI and cron
- [Tools](./tools.md) — the 35 built-in tools and extending them
- [Safety](./safety.md) — guards, allowlists, database writes
