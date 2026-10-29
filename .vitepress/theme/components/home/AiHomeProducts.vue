<template>
  <section class="ai-products">
    <div class="ai-prod-inner">
      <div class="ai-sec-head">
        <div>
          <p class="ai-kicker">Ecosystem</p>
          <h2 class="ai-h2">One stack for agentic applications.</h2>
        </div>
        <p class="ai-lede">Each package does one job and composes with the rest. Adopt the layers you need.</p>
      </div>
      <div class="ai-list">
        <article v-for="p in products" :key="p.slug" class="ai-row">
          <span class="ai-cat">{{ p.category }}</span>
          <div>
            <span class="ai-stable">{{ p.status === 'stable' ? 'Stable' : 'In progress' }}</span>
            <h3 class="ai-h3">{{ p.title }}</h3>
            <p class="ai-composer">{{ p.composer }}</p>
          </div>
          <p class="ai-desc">{{ p.details }}</p>
          <div class="ai-card-links">
            <a class="ai-card-link" :href="p.link">Docs →</a>
            <a
              v-if="p.github"
              class="ai-card-link ai-gh-link"
              :href="p.github"
              target="_blank"
              rel="noopener"
            >GitHub →</a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
// Links mirror .vitepress/plugins-config.js and resolve to existing pages only.
// github falls back to the org profile when the package repo URL is unverified.
const org = 'https://github.com/crustum'
const products = [
  {
    slug: 'ai',
    title: 'CakePHP AI',
    composer: 'crustum/cakephp-ai',
    category: 'core',
    status: 'stable',
    details: 'Unified API for 17 AI providers: agents with tools and sub-agents, structured output, images, audio, transcription, embeddings with reranking, streaming, queueing and broadcasting.',
    link: '/getting-started/',
    github: 'https://github.com/Crustum/cakephp-ai',
  },
  {
    slug: 'interaction',
    title: 'AiInteraction',
    composer: 'crustum/ai-interaction',
    category: 'core',
    status: 'stable',
    details: 'UI-agnostic interaction primitives: turn runner, slash commands, sessions with titles, input history, per-user preferences and a response-stop contract.',
    link: '/interaction/',
    github: org,
  },
  {
    slug: 'tui',
    title: 'AiTui',
    composer: 'crustum/ai-tui',
    category: 'terminal',
    status: 'stable',
    details: 'Fastest way in: terminal chat with any agent via a single ai chat command with key bindings, input recall and tool-call cards on AiInteraction turns.',
    link: '/interaction/tui',
    github: org,
  },
  {
    slug: 'nexus',
    title: 'AiNexus',
    composer: 'crustum/ai-nexus',
    category: 'web',
    status: 'stable',
    details: 'Web dashboard and playground for agents: discovery, streaming chat, attachments and retention.',
    link: '/debugger/index',
    github: org,
  },
  {
    slug: 'panifex',
    title: 'Panifex',
    composer: 'crustum/panifex',
    category: 'harness',
    status: 'stable',
    details: 'CakePHP harness for coding agents: autonomous runs, terminal UI, web chat-ops and other channels, plus 14 agent variants, 35 tools, guards and healing.',
    link: '/panifex/',
    github: org,
  },
  {
    slug: 'mcp',
    title: 'MCP',
    composer: 'crustum/mcp',
    category: 'protocol',
    status: 'stable',
    details: 'Model Context Protocol servers and clients for CakePHP: tools, resources, and prompts over HTTP or STDIO, OAuth via Tessera, and interactive MCP Apps.',
    link: '/mcp/',
    github: 'https://github.com/Crustum/mcp',
  },
  {
    slug: 'ignis',
    title: 'Ignis',
    composer: 'crustum/ignis',
    category: 'dev',
    status: 'stable',
    details: 'Coding-assistant toolkit: composed guidelines, on-demand skills, a live MCP server, and project rules that teach agents your application.',
    link: '/ignis/',
    github: 'https://github.com/Crustum/ignis',
  },
  {
    slug: 'explorator',
    title: 'Explorator',
    composer: 'crustum/explorator',
    category: 'search',
    status: 'stable',
    details: 'Full-text and vector search for CakePHP: collection, database, Algolia, Meilisearch, and Typesense drivers with RAG-ready embeddings.',
    link: '/rag/',
    github: 'https://github.com/Crustum/explorator',
  },
  {
    slug: 'demo',
    title: 'AiDemo',
    composer: 'cakephp/app skeleton',
    category: 'demo',
    status: 'stable',
    details: 'Runnable demo application: an Assistant agent with four tools (weather, location, temperature conversion, approval-gated email) over HTTP and console.',
    link: '/demo/',
    github: org,
  },
]
</script>

<style scoped>
.ai-products {
  background: var(--ai-bg-canvas);
}

.ai-prod-inner {
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 64px var(--ai-gutter);
}

.ai-sec-head {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: end;
}

.ai-kicker {
  margin: 0 0 10px;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-kicker) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--ai-ls-kicker);
  color: var(--ai-brand-1);
}

.ai-h2 {
  margin: 18px 0 0;
  font-size: var(--ai-fs-h2);
  line-height: var(--ai-lh-tight);
  letter-spacing: var(--ai-ls-heading);
  font-weight: 600;
  color: var(--ai-text-primary);
}

.ai-lede {
  margin: 12px 0 0;
  max-width: 720px;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: var(--ai-text-subtle);
}

.ai-list {
  margin-top: 55px;
  border-top: 1px solid var(--ai-border-soft);
}

.ai-row {
  display: grid;
  grid-template-columns: 80px 220px 1fr 140px;
  gap: 24px;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid var(--ai-border-soft);
}

.ai-cat {
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  color: var(--ai-text-soft);
}

.ai-stable {
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  color: var(--ai-success);
}

.ai-h3 {
  margin: 3px 0;
  font-size: calc(var(--ai-fs-h3-row) * var(--ai-font-scale, 1));
  font-weight: 600;
  color: var(--ai-text-primary);
}

.ai-composer {
  margin: 0;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  color: var(--ai-text-soft);
}

.ai-desc {
  margin: 0;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-body);
  color: var(--ai-text-weak);
}

.ai-card-links {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.ai-card-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: calc(var(--ai-fs-chip) * var(--ai-font-scale, 1));
  font-weight: 600;
  color: var(--ai-brand-1);
}

.ai-gh-link {
  color: var(--ai-text-subtle);
}

@media (min-width: 960px) {
  .ai-prod-inner {
    padding: 125px var(--ai-gutter);
  }

  .ai-sec-head {
    grid-template-columns: 1fr 370px;
    gap: 60px;
  }
}

@media (max-width: 860px) {
  .ai-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .ai-card-links {
    justify-content: flex-start;
  }
}
</style>
