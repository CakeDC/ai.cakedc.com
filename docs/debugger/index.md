---
description: 'Debugger: discover agents, stream playground chat, inspect runs. Backend is AiNexus.'
---

# Debugger

Building an agent is a tight loop: change the prompt, run it, check the tool
calls, repeat. The debugger moves that loop into a browser, away from log files
and reruns. Open it to see which agents the app knows, chat with any of them in
a playground, and look back through what happened underneath. Three screens,
one sidebar: Discovery, Playground, History. Everything below is served by the
AiNexus plugin from a single mount point; the host application only decides who
may open it.

What you get:

- Discovery: every agent class in your app, with its provider, model, and
  tools. Write a class, reload, it's there.
- Chat playground: streaming replies, attachments, a model picker for
  trying another model without touching code, and full conversation persistence.
- Tool inspection: each call inline as a card, with arguments and results, and
  failures marked as failures.
- Info panel: the agent's config, system prompt, and tool schemas, exactly
  as the run uses them.
- History: search, filter, reopen, rename, and delete past conversations.

## Open it

AiNexus lives under `AiNexus.ui.path` (default `ai_nexus`), so the dashboard
opens at `/ai_nexus` and every screen inside it is a frontend route:

| Screen | Route | What you do there |
|---|---|---|
| Discovery | `/` | Browse agent cards, open one in the playground. |
| Playground | `/playground/:agent` | Chat with the agent, inspect its setup. |
| History | `/history` | Search, filter, reopen, rename, or delete past conversations. |

Access control belongs to the host application, which applies its own middleware
(authentication, authorization checks) through `AiNexus.ui.middleware`.
`enabled` defaults off in production, so the debugger never ships open by
accident.

```php
// config/ai_nexus.php (host copy of the plugin default)
return [
    'AiNexus' => [
        'enabled' => (bool)env('AI_NEXUS_ENABLED', env('APP_ENV', 'development') !== 'production'),
        'ui' => [
            'path' => env('AI_NEXUS_PATH', 'ai_nexus'),
            'middleware' => [],
        ],
        'discovery' => [
            'paths' => [],
            'ignore' => [],
        ],
        'storage' => [
            'connection' => env('AI_NEXUS_DB_CONNECTION', null),
            'attachments_disk' => env('AI_NEXUS_ATTACHMENTS_DISK', 'local'),
        ],
        'retention' => [
            'auto_prune' => env('AI_NEXUS_AUTO_PRUNE', false),
            'days' => (int)env('AI_NEXUS_PRUNE_DAYS', 7),
        ],
    ],
];
```

The file loads via `Configure::load('ai_nexus')`.

## Discovery: pick an agent

The landing screen is an Agents grid, rescanned from your configured agent
paths on every request. There is no cache, so a new agent class shows up on reload.
Each card shows the agent name, its provider and model (or model tier), and its
tool tags. An agent whose constructor fails is listed with its error instead of
being silently dropped. With no agents at all, the screen points at
`app/Agents/` to create one.

An agent whose constructor takes arguments the container cannot provide (a
scalar value, an untyped parameter, or an interface with no binding) gets an
unavailable card: it shows the error and names the unresolvable parameters.
The card is not clickable, and its footer says to fix the error and reload.
Bind the missing dependencies in the app, refresh Discovery, and the agent
becomes available.

Click a card to open that agent in the playground. The info action on a card
opens the same playground with the agent-info panel already visible.

## Playground: chat and inspect

The playground is one chat column: agent header on top, scrolling thread in the
middle, composer at the bottom. The URL carries the state
(`/playground/:agent?c=<conversation>`), so a conversation is a link you can
reopen. Each agent also remembers its last conversation and reopens it for you.

The header names the agent and its provider/model, with live token totals once
messages exist. Badges explain the edges: stateless agents answer every message
independently, buffered runtimes deliver replies all at once instead of
streaming, and a conversation whose agent no longer exists opens read-only.

The thread renders answers as markdown with copy buttons, reasoning in its own
pane ahead of the answer, tool calls as cards, and structured answers as data
cards. Failures and notices appear inline in the thread. A failed turn arrives
as a stream error part, not a blank page.

The composer is a textarea with file attachments (generic files, audio,
images), a model picker to override the agent's model for one turn, and send.
Uploads are stored before the answer streams, so a storage failure surfaces
before the reply starts, not mid-stream. The conversation menu starts a fresh
thread or clears the current one; there is deliberately no clear-all button
anywhere in the UI. Use the `clear` console command for that.

The info button beside the menu opens the agent panel with three tabs: Config
(how this agent is set up), Prompt (its instructions), and Tools (what it can
call, including MCP and provider-native entries).

## History: find any run

History is a filterable, paginated table of past conversations with a live
total: text search, agent filter, status filter, tool filter, date range, and
newest/oldest sort. Filters live in the URL, so a filtered view is shareable.
Each row opens its conversation back in the playground, renames it, or deletes
it; the table refreshes live as new runs land.

Retention follows `AiNexus.retention`: `auto_prune` with a `days` window
(default 7), otherwise runs are kept until pruned manually.

## Console

```bash
bin/cake ai_nexus status
bin/cake ai_nexus prune
bin/cake ai_nexus clear
```

`status` prints the version, enabled flag, path, storage, retention window, and
an agent table with availability and errors, the same broken-constructor
errors the Discovery cards show, in text form. `prune` drops expired runs, `clear`
wipes the store.

*Backend today: AiNexus. This page describes the website; endpoints, stream
protocol, and store migrations stay in its repo.*

## Where next

- [Agents](./../agents/index.md) — lifecycle and prompting
- [Agent tools](./../agents/tools.md) — what the info panel lists
- [Approvals](./../agents/approvals.md) — human gates on tool calls
- [Observability](./../observability/index.md) — events and recorders
