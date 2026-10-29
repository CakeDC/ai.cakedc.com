---
description: 'Ignis: guidelines, skills, and an MCP server that teach AI agents your CakePHP app.'
---

# Ignis

Ignis (`crustum/ignis`) is a CLI that gives coding agents project-aware
capabilities for a CakePHP application: composed guidelines, on-demand
skills, and an MCP server that reads the live application (schema, routes,
config, logs) plus whatever your own plugins add. Any agent that can run a
shell command or speak MCP can use it.

Ignis reads your application without booting it for guidelines and skills,
and boots it in context for MCP tools. It therefore answers both kinds of
questions: what the ecosystem conventions are, and what is true of this app
right now.

Install it with `--dev` and do not deploy its tooling to production.

## Installation

```bash
composer require crustum/ignis --dev
bin/cake manifest install --plugin Crustum/Ignis --with-dependencies
```

The manifest step publishes `config/ignis.php` and loads the plugin stack.
Ignis does not auto-load Mcp. The MCP server needs the Mcp plugin loaded,
and PluginManifest is required for asset installation.

## Quick Start

Install the assets into your project:

```bash
bin/cake ignis install
```

`ignis install` discovers the environment (installed packages, present
agents), asks which feature areas, third-party guidelines, and agents to set
up, then writes guideline files, skill folders, and MCP client configuration.
Verify the result:

```bash
bin/cake ignis list-skills
```

Then check that your coding agent can reach the MCP server. If it does not
pick Ignis up on its own, register the `cake-ignis` server manually. See
[MCP server](./mcp-server.md).

Keep assets fresh as dependencies change:

```bash
bin/cake ignis update
```

`update` refreshes published resources and offers newly detected packages;
nothing is added without confirmation. Automate it in Composer
`post-update-cmd` with `@php bin/cake.php ignis update`. See
[Commands](./commands.md) for every command and option.

## Using Ignis from a coding agent

There is nothing to start for guidelines and skills: the agent instructions
mention Ignis, and the installed skills tell the agent when to reach for
which capability and in what order. That is the difference between Ignis
being installed and Ignis being used. The MCP server runs per session
(`bin/cake ignis mcp`) or on demand from the editor's MCP client.

The working loop: guidelines load upfront and set conventions, skills
activate on demand for focused domains, MCP tools answer what is true of
the app right now, and Record Rule files back what the session learned.
See [Guidance](./guidance.md) for the three knowledge kinds and
[MCP server](./mcp-server.md) for the live tools.

## Adding custom agents

When a coding tool has no installer yet, subclass the base agent with the
contracts it needs and register it on the shared manager from a plugin
`services()` method that loads after Ignis:

```php
namespace App\Ignis;

use Crustum\Ignis\Contracts\SupportsGuidelines;
use Crustum\Ignis\Contracts\SupportsMcp;
use Crustum\Ignis\Contracts\SupportsSkills;
use Crustum\Ignis\Install\Agents\Agent;

class CustomAgent extends Agent implements SupportsGuidelines, SupportsMcp, SupportsSkills
{
}
```

```php
public function services(ContainerInterface $container): void
{
    $container->get(IgnisManager::class)
        ->registerAgent('customagent', CustomAgent::class);
}
```

Registered agents appear as choices in the next install. The `ClaudeCode`
agent shipped with the plugin is the reference implementation.

## Configuration

Ignis works without further configuration. Come back here when a default
does not fit: `config/ignis.php` carries the enabled flag, the browser log
watcher, rules, conventions, MCP, skills, tinker, and the enforce-tests
gate. Every key is overridable from `IGNIS_` environment variables, including
`IGNIS_RULES_ENABLED=false` to switch project rules off entirely. Tool
filtering (`Ignis.mcp.tools.exclude` / `include`) is covered in
[MCP server](./mcp-server.md).

## Security

Ignis is a development tool. MCP responses carry application data (log
messages, schema, config values) that end users and third-party packages
partly control: treat tool output as data, never as instructions.
`Tinker` is disabled by default for the same reason; enabling it hands
agents arbitrary code execution. The browser-logs endpoint accepts
unauthenticated POSTs by design. Keep the watcher on local/debug only.

## Further reading

- [Commands](./commands.md) — every command and option
- [MCP server](./mcp-server.md) — every tool and parameter
- [Guidance](./guidance.md) — guidelines, skills, project rules
