# CakePHP AI Hub

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fai.cakedc.com&style=flat-square&label=ai.cakedc.com)](https://ai.cakedc.com)
[![License](https://img.shields.io/github/license/CakeDC/ai.cakedc.com.svg?style=flat-square)](LICENSE.txt)
[![VitePress](https://img.shields.io/badge/built%20with-VitePress-646cff?style=flat-square)](https://vitepress.dev)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen?style=flat-square)](https://nodejs.org)

Source of **[ai.cakedc.com](https://ai.cakedc.com)**, a curated hub of plugins and tools for building
AI into CakePHP applications, and for using AI to build them. It lists CakeDC and community
resources picked by the CakeDC team, and it hosts documentation for the CakePHP AI stack.

## What's in the hub

| Resource type | What it covers |
|:--------------|:---------------|
| Plugins | CakePHP plugins for agents, search, UI and tooling |
| MCP servers | Servers that expose CakePHP apps and data to AI clients |
| Claude skills | Reusable skills that teach coding agents CakePHP |
| CLI tools | Command-line helpers for AI work on CakePHP projects |

The hub is just getting started. Plugins and MCP servers are listed today, and skills and CLI tools
are coming soon. Catalog entries live in
[`.vitepress/theme/components/home/hub-data.js`](.vitepress/theme/components/home/hub-data.js).

The documentation sections under `docs/` cover the CakePHP AI stack: CakePHP AI, AiInteraction,
AiTui, AiNexus, Panifex, MCP, Ignis, Explorator and AiDemo. Pages for early-stage areas carry
warning banners and stay at configuration/roster level until real guides land.

## Requirements

* Node.js 22+
* npm

## Develop

```bash
npm install
npm run docs:dev      # local dev server
npm run docs:build    # static output in .vitepress/dist
npm run docs:preview  # serve the production build
```

`docs:preview` serves the files that existed when it started. If you rebuild, restart it.

## Deployment

The site is hosted on Cloudflare Pages and redeploys on every push to `main`.

| Setting | Value |
|:--------|:------|
| Build command | `npm run docs:build` |
| Output directory | `.vitepress/dist` |
| Environment | `NODE_VERSION=22` |
| Domain | `ai.cakedc.com` (CNAME in the `cakedc.com` zone) |

## Content rules

* Only real, verifiable resources are listed. No invented products, endpoints or links.
* Entries without a verified GitHub URL are not given a made-up one.
* Early-stage or unlicensed resources are labelled as such in their description.
* Every listed resource keeps its own license (see [NOTICE.md](NOTICE.md)).

## Suggest a resource

Listing is curated by the CakeDC team. To propose a plugin, MCP server, skill or CLI tool,
[open an issue](https://github.com/CakeDC/ai.cakedc.com/issues/new?template=suggest-a-resource.md).
See [CONTRIBUTING.md](CONTRIBUTING.md) for what we look for.

## Changelog and roadmap

* [CHANGELOG.md](CHANGELOG.md)
* [TODO.md](TODO.md)

## License

Released under the [MIT License](LICENSE.txt), Copyright Cake Development Corporation.
The site skeleton and theme originate from [crustum/docs](https://github.com/crustum/docs),
see [NOTICE.md](NOTICE.md).
