# TODO

## Before going public

- [ ] Confirm the license of `crustum/docs` (skeleton, scripts, theme were copied from it) and get permission or credit as needed. I could not read its license; see `NOTICE.md`.
- [ ] Make the GitHub repo public and set its description, topics and homepage (`https://ai.cakedc.com`).
- [ ] Check the badges in `README.md` render once the repo is public.
- [ ] Once a CI build check exists, add a build badge back to `README.md`.

## Catalog

- [ ] Add a page per resource type (plugins, MCP servers, skills, CLI tools), generated from `hub-data.js`.
- [ ] Add Claude skills and CLI tools. The tiles show "Soon" until there is a first entry.
- [ ] Evaluate candidates before listing (read README, license, CakePHP support, last release):
  - [ ] `chrisshick/cakephp-agent` (skills and rules for coding assistants, Apache-2.0, `1.0.0-beta.2`)
  - [ ] `Crustum/cakephp-open-router` (OpenRouter wrapper; may overlap with the CakePHP AI provider layer)
  - [ ] `eduplex-api/cake-api-ai` (SBERT-based; probably niche)
  - [ ] `pekral/ai-olympus` (unclear whether CakePHP-specific)
- [ ] Verify GitHub URLs for AiInteraction, AiTui, AiNexus, Panifex and AiDemo. They fall back to the org profile today.
- [ ] Decide whether CakeDC MCP and Synapse get docs pages here or stay GitHub-only.
- [ ] Let `isNew` expire automatically (an `added` date per entry).

## Upstream follow-ups

- [ ] `CakeDC/cakephp-mcp`: add a license and finish the README (the example is still "example here"). It pins `mcp/sdk` to `dev-main#4b91567`, so installing it needs `minimum-stability: dev`.

## Site

- [ ] Rework the sidebar. It is still one global tree organised around the CakePHP AI capabilities.
- [ ] Remove the unused old home components: `AiHomeProviders`, `AiHomeTopics`, `AiHomeCapabilities`, `AiHomeInterfaces`, `AiHomeCta`.
- [ ] Add a CI build check for pull requests.

## Done

- [x] Cloudflare Pages deployment and `ai.cakedc.com` custom domain (CNAME `ai` in the `cakedc.com` zone). First deploy from `20c9a6d`.
- [x] Home page reworked as a curated hub (hero, goal cards, typed catalog, quickstart). `c853755`.
- [x] CakeDC MCP and Synapse added as MCP servers, "New" badge added. `80d8144`.
- [x] Removed the unused GitHub Pages workflow (`.github/workflows/deploy.yml`); production deploys through Cloudflare Pages.
- [x] README, CHANGELOG, CONTRIBUTING, LICENSE, NOTICE, TODO and the "Suggest a resource" issue template added.
