# CakePHP AI Docs

Documentation site for the CakePHP AI ecosystem (CakePHP AI, AiInteraction, AiTui, AiNexus, Panifex, AiDemo). VitePress, standalone repo with its own GitHub Pages deployment.

## Base

The `.vitepress` skeleton, scripts, workflow and theme were copied from [docs_crustum](https://github.com/crustum/docs) (VitePress `^2.0.0-alpha.12`) and adapted: 6-product catalog instead of 33 plugins, explicit section sidebars, `CakePHP AI` branding, standalone `base: '/'`. No plugin content was copied — every docs page is written from workspace source.

## Content rule

Only the six real workspace plugins are documented. No sponsors, no invented products, endpoints or links. Pages for stub areas (AiNexus, Panifex) carry warning banners and stay configuration/roster reference until real guides land. Catalog entries without a verified GitHub URL use `githubUrl: null`.

## Develop

Requires Node >= 22.

```powershell
npm install
npm run docs:dev      # local preview
npm run docs:build    # static output in .vitepress/dist
npm run docs:preview  # serve the build
```

