---
title: Panifex MCP server
description: 'Call Panifex tools from any MCP client: setup, served tools, safety rules.'
---

# MCP server

Panifex tools are not only for Panifex agents. `PanifexServer` (`src/Mcp/PanifexServer.php`, adapting tools through `src/Mcp/Tool/AiToolAdapter.php`) serves them over the Model Context Protocol over stdio, so any MCP client (Claude Code, Cursor, Zed, any agent that speaks MCP) can use CakePHP-aware tools against your app. That means coding from any agent: the client brings the model, Panifex brings the tools that understand your CakePHP codebase, with the same safety layer enforced in PHP.

## Setup

Serve it through the MCP plugin's command (registered via the Panifex plugin bootstrap):

```bash
bin/cake mcp start panifex
```

Register it with Claude Code from your app directory:

```bash
claude mcp add panifex -- bin/cake mcp start panifex
```

Or add it to `.mcp.json` manually:

```json
{
  "mcpServers": {
    "panifex": {
      "command": "bin/cake",
      "args": ["mcp", "start", "panifex"]
    }
  }
}
```

From that point the client's tool list includes the Panifex tools below, and the model can call them like any native tool.

## Served tools

The exposed set is controlled by `Panifex.mcp.tools` and defaults to 16 read, inspect, and analysis tools: no file writes, no shell:

| Tool | What the client gets |
|---|---|
| `ReadFile` | Read a text file, or a line range — the client's window into your code |
| `Glob` | List files matching a pattern (protected paths excluded) |
| `SearchCode` | Grep-style search returning file, line, and snippet |
| `GitDiff` | Show staged, committed, or ranged diffs |
| `ListRoutes` | Registered routes with method, URI, name, and action |
| `DescribeRoute` | One route as the framework resolved it — middleware, bindings, validation, authorization |
| `DescribeTables` | Real columns, casts, finders, and associations for a table — schema answers without reading files |
| `DescribeSchema` | Raw tables, columns, types, indexes, and foreign keys off the live connection |
| `QueryDatabase` | Read-only `SELECT`, capped at 100 rows, returned as JSON |
| `MutateDatabase` | Guarded single write — same confirmation rules as in agent sessions; rolls back with no human to confirm |
| `ReadLog` | Last lines of the application log, with optional filter |
| `ReadSpeculumEntry` | Speculum exception entries for the failing code under discussion |
| `ReadSentryIssue` | Sentry issue with exception, stacktrace, breadcrumbs, and request context |
| `ReadIssue` | Tracker issue with title, body, labels, and comments |
| `ReadPullRequest` | Pull or merge request with branch, state, and review comments |
| `RunPhpstan` | PHPStan findings for a path — the client verifies its own edits |
| `RunTests` | Pest summary — pass/fail counts with `file:line` failures, not the raw log |

What this gives you in practice: the client reads your code (`ReadFile`, `SearchCode`), understands the schema without guessing (`DescribeTables`, `DescribeSchema`), checks how routes behave (`DescribeRoute`), looks at failing context (`ReadLog`, `ReadSentryIssue`, `ReadSpeculumEntry`), verifies its own work (`RunPhpstan`, `RunTests`), and reports back. The pieces it cannot do, editing files, running shells, stay with the tools you explicitly add.

Add write tools (`EditFile`, `WriteFile`, `RunCodingStyle`) to `Panifex.mcp.tools` when you trust the connected client. That is the line between "the client reviews and diagnoses" and "the client edits your codebase". Cross it deliberately.

## Safety rules

The same safety layer applies exactly as it does for Panifex's own agents: protected paths block reads, the CakePHP allowlist gates `RunCake`-family execution, database queries stay read-only, and context guards bound oversized results. Interactive tools (`AskUser`, `ConfirmAction`) are refused outright. An MCP client has no terminal to answer their prompts. Avoid tools that ask for terminal confirmation, such as `CommitAndPush`: they would hang the stdio session.

Hooks do not apply to tools served over MCP. The connected MCP client is the policy layer there. The guard pack still does: path, secret, network, and composer-script enforcement runs in PHP underneath, regardless of which client called.

## The other direction

Panifex's agents can also consume external MCP servers (a browser, an external system, anything you trust) as agent tools. The agent declares them, the harness runs them. See [Extending](./extending.md).

## Next steps

- [Tools](./tools.md) — the full built-in toolset these are drawn from
- [Hosting connections](./connections-hosting.md) — trackers and Sentry behind the issue tools
- [Safety](./safety.md) — the enforcement underneath
