---
description: 'MCP tools: the Ai binding for MCP client and server tools; protocol lives in the MCP package docs.'
---

# MCP tools

This page is the binding only. The Model Context Protocol (client,
servers, transports) is documented in the MCP package itself; nothing
here repeats it. What Ai adds are two wrappers that let MCP tools ride an
agent's `tools()` list like any local tool, with schemas converted and
results normalized to strings.

`McpServerTool` wraps a tool served by your own application (a
`Crustum\Mcp\Server\Tool`): the call runs through the MCP request
container and the response is flattened to text:

```php
use Crustum\Ai\Tools\McpServerTool;

public function tools(): iterable
{
    return [
        new McpServerTool(new SearchOrders()),
    ];
}
```

`McpTool` wraps the other direction: a tool primitive from an MCP client
(`supports()` tells the two apart): its calls go to the remote server,
and structured or error payloads come back as message strings. Its name
is prefixed (`mcp_tools_<name>`) so remote names never collide with local
ones:

```php
use Crustum\Ai\Tools\McpTool;

public function tools(): iterable
{
    return [
        new McpTool($clientTool),
    ];
}
```

Both wrappers are approval-aware with approval off by default. Gate a
destructive remote call the same way as a local one, see
[Approvals](./approvals.md). Both need the MCP package installed. For
creating servers, authentication, and transports, read the MCP package
documentation and the [protocol site](https://modelcontextprotocol.io).

## Where next

- [MCP](./../mcp/index.md) — install, servers, tools, clients, apps
- [Tools](./tools.md) — local tool authoring
- [Approvals](./approvals.md) — human gates on tool calls
