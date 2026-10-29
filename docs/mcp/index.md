---
description: 'MCP plugin: expose tools, resources, and prompts to AI clients. Install and section guide.'
---

# MCP

The MCP plugin (`crustum/mcp`) lets AI clients talk to your CakePHP
application through the Model Context Protocol: servers expose **tools**
(callable actions), **resources** (context data), and **prompts** (reusable
templates), and the plugin handles the JSON-RPC transport, session headers,
and schema advertisement. This section is the site guide: install, commands,
servers, tools, clients, apps, auth. The full protocol reference ships with
the [`crustum/mcp` package](https://github.com/Crustum/mcp) itself.

Expose a server over HTTP for remote agents, or as a local STDIO process for
IDE agents and desktop clients. The same server class can serve both
transports. See [Servers](./servers.md).

## Install

```bash
composer require crustum/mcp
bin/cake plugin load Crustum/Mcp
bin/cake manifest install --plugin=Crustum/Mcp
```

Loading the plugin registers container bindings, console commands, MCP
middleware aliases, and the plugin routes used by HTTP servers and OAuth
discovery. The manifest step copies `config/mcp.php` into your application;
without it, load the config manually:

```php
public function bootstrap(): void
{
    Configure::load('mcp', 'default');
}
```

Application configuration lives under the `Mcp` key:

```php
return [
    'Mcp' => [
        'Servers' => [
            // ['route' => 'mcp/weather', 'server' => WeatherServer::class, 'middleware' => []],
        ],
        'local' => [
            // 'weather' => WeatherServer::class,
        ],
        'base_url' => null,
        'redirect_domains' => [
            '*',
        ],
    ],
];
```

Web servers register in `Mcp.Servers`, local STDIO servers in `Mcp.local`.
See [Servers](./servers.md). In production set
`require_web_auth_middleware` to `true` so web servers without a middleware
list fail at registration instead of serving open.

## Where next

- [Commands](./commands.md) — scaffold your first server
- [MCP tools](./../agents/mcp-link.md) — using MCP tools inside agents
