---
description: 'MCP console commands: bake scaffolding for servers, tools, prompts, resources, apps.'
---

# Commands

Every MCP primitive scaffolds from a bake command; local servers run and
inspect from two `mcp` commands. All names below are the real command names
defined by the plugin.

## Bake

```bash
bin/cake bake mcp_server WeatherServer
bin/cake bake mcp_tool CurrentWeatherTool
bin/cake bake mcp_prompt DescribeWeatherPrompt
bin/cake bake mcp_resource WeatherGuidelinesResource
bin/cake bake mcp_app_resource WeatherDashboardApp
```

Servers land in `src/Mcp/Servers`, tools in `src/Mcp/Tools`, prompts in
`src/Mcp/Prompts`, resources in `src/Mcp/Resources`. The generated server
extends `Crustum\Mcp\Server` with `#[Name]`, `#[Version]`, and
`#[Instructions]` attributes plus `$tools` / `$resources` / `$prompts`
arrays. Register each baked primitive there (see [Servers](./servers.md)).

## Run and inspect

```bash
bin/cake mcp start weather
bin/cake mcp inspector mcp/weather
bin/cake mcp inspector weather
```

`mcp start <handle>` boots the local server registered under that handle and
speaks MCP over standard input/output. `mcp inspector <handle>` launches the
MCP Inspector for a web route or a local handle; for protected web servers
pass the `Authorization` bearer header when connecting.

## Where next

- [Servers](./servers.md) — register what you baked
- [Tools](./tools.md) — write the tool itself
