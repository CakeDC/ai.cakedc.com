---
description: 'Ignis command reference: install, update, skills, tools, debugging.'
---

# Commands

`bin/cake ignis` gives coding agents project-aware capabilities for a
CakePHP application: composed guidelines, installed skills, and an MCP
server over the live app. This page lists every command with its options.
The parameters of the individual MCP tools are listed in
[MCP server](./mcp-server.md).

## Setup

### `ignis install`

Install guidelines, skills, and MCP configuration. Discovers the
environment, asks which feature areas, third-party guidelines, and agents
to set up, then writes in three passes: guideline composition, skill
installation, MCP client configuration.

Options:

- `--guidelines`, `--skills`, `--mcp` — install only those feature areas.
- `--path`, `-p` — write assets into this directory (a plugin folder as its
  own project) while discovering packages from the application. Aborts when
  the target already has generated assets unless `--force` is set.
- `--force` — with `--path`, allow installing where assets already exist.

```bash
bin/cake ignis install
bin/cake ignis install --guidelines --skills --mcp
bin/cake ignis install --path=plugins/myplugin
bin/cake ignis install --path=plugins/myplugin --force
```

### `ignis update`

Refresh published resources to the latest guidance. Discovers newly
installed packages and offers their guidelines and skills. Nothing is added
without confirmation.

Options:

- `--discover` — discover and prompt for newly available guidelines and
  skills (default).
- `--no-discover` — refresh only what is already published.
- `--ignore-skills` — skip updating the skills directory.
- `--path`, `--force` — forwarded to `ignis install` for plugin-folder
  targets.

```bash
bin/cake ignis update
bin/cake ignis update --no-discover
bin/cake ignis update --ignore-skills
```

## Skills

### `ignis list-skills`

List installed skills with their source package. Read-only. The first check
that an install did what it should.

```bash
bin/cake ignis list-skills
```

### `ignis add-skill`

Add skills from a remote GitHub repository.

Options:

- `--list` — list available skills.
- `--all` — install all skills.
- `--skill` — specific skills to install (repeatable).
- `--force` — overwrite existing skills.
- `--skip-audit` — skip the security audit.

```bash
bin/cake ignis add-skill --list
bin/cake ignis add-skill --all
```

### `ignis index-rules`

Regenerate the `.ai/rules/index.md` map from the rule files. Run it after
hand-editing rules. Hand-written files are invisible to agents until the
index is rebuilt. See [Guidance](./guidance.md).

```bash
bin/cake ignis index-rules
```

## Tools

### `ignis list-tools`

List available Ignis MCP tools with their descriptions. The same set the
server in [MCP server](./mcp-server.md) advertises, including tools other
plugins appended. Read-only.

Options:

- `--format=list|json` — human-readable list (default) or machine-readable
  JSON.

```bash
bin/cake ignis list-tools
bin/cake ignis list-tools --format=json
```

### `ignis execute-tool`

Execute one Ignis MCP tool in isolation and print its result envelope. The
fastest way to check what an agent would see before blaming the model.
Takes the fully-qualified tool class and base64-encoded JSON arguments
(`e30=` is `{}`; no arguments).

```bash
bin/cake ignis execute-tool "Crustum\Ignis\Mcp\Tools\ApplicationInfo" e30=
bin/cake ignis execute-tool "Crustum\Ignis\Mcp\Tools\DatabaseConnections" e30=
```

The response is the result envelope:

```json
{"isError":false,"content":[{"type":"text","text":"{...}"}]}
```

## Debugging

### `ignis mcp`

Start the Cake Ignis MCP server (delegates to the Crustum MCP stack). The
command editors invoke through their MCP client configuration.

```bash
bin/cake ignis mcp
```

### `ignis inspector`

Open the MCP Inspector for the Cake Ignis server.

Options:

- `--host`, `--port`, `--url` — bind address and absolute server URL
  overrides.

```bash
bin/cake ignis inspector
```

## Where next

- [Start](./index.md) — install and quick start
- [MCP server](./mcp-server.md) — every tool and parameter
- [Guidance](./guidance.md) — guidelines, skills, project rules
