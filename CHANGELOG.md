Changelog
=========

This site is deployed continuously from `main`, so entries are dated instead of versioned.

2026-10-29
----------
* Added `CHANGELOG.md`, `TODO.md`, `CONTRIBUTING.md`, `LICENSE.txt` (MIT) and `NOTICE.md`; rewrote `README.md` for the hub
* Added the "Suggest a resource" issue template
* Added package metadata (license, repository, homepage, Node engine) to `package.json`
* Added CakeDC MCP (`cakedc/cakephp-mcp`) and Synapse (`josbeir/cakephp-synapse`) to the catalog as MCP servers
* Added a "New" badge for catalog entries flagged with `isNew`
* The catalog list now shows every resource type; entries without a docs page link to GitHub only
* Reworked the home page as a curated hub: new hero, goal-driven "What are you building?" section, typed catalog with "Soon" labels, quickstart section, and a CakeDC footer
* Catalog data moved to `.vitepress/theme/components/home/hub-data.js` with a `type` per entry
* Updated the home page meta description for the hub concept
* Ignored the `.superpowers/` mockup folder
* Deployed to Cloudflare Pages at `ai.cakedc.com` (custom domain on the `cakedc.com` zone)
* Removed the GitHub Pages deploy workflow (`.github/workflows/deploy.yml`); the site is deployed by Cloudflare Pages

2026-10-29 (initial)
--------------------
* Initial version: VitePress documentation site for the CakePHP AI ecosystem (CakePHP AI, AiInteraction, AiTui, AiNexus, Panifex, MCP, Ignis, Explorator, AiDemo), based on the `crustum/docs` skeleton
