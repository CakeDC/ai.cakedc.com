---
description: How to run every docs example — tiers, commands, run.log convention.
---

# Examples setup

Planned in **M10**. Three tiers: `offline` (no keys/network, CI re-runs), `local-llm` (Ollama), `live-key` (author runs once, badge on page).

Every example: runnable file + committed `run.log` + docs page importing via `<<<`. Templates and the `docs verify` gate live in `AiDocsHarness` (`bin/cake docs verify`, run immediately after the docs build, no deferred checks).
