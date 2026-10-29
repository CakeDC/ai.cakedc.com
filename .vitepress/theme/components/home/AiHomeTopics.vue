<template>
  <section class="ai-topics">
    <div class="ai-topics-inner">
      <div class="ai-sec-head">
        <div>
          <p class="ai-kicker">Start exploring</p>
          <h2 class="ai-h2">Pick a track.</h2>
        </div>
        <p class="ai-lede">Big areas of the docs. Every link below leads to practical, version-aware guidance.</p>
      </div>
      <div class="ai-grid">
        <article v-for="(t, i) in topics" :key="t.title" class="ai-topic">
          <a class="ai-topic-main" :href="t.link">
            <div class="ai-topic-top">
              <span>{{ String(i + 1).padStart(2, '0') }}</span>
              <span aria-hidden="true">→</span>
            </div>
            <h3 class="ai-h3">{{ t.title }}</h3>
            <p class="ai-topic-desc">{{ t.details }}</p>
            <span class="ai-topic-open">Open {{ t.title }} →</span>
          </a>
          <ul class="ai-topic-sub">
            <li v-for="s in t.sublinks" :key="s.link">
              <a :href="s.link">{{ s.text }}</a>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
// Big squares for the five main tracks. All links verified against docs/.
const topics = [
  {
    title: 'Agents',
    details: 'Prompt, stream, remember conversations, approve tool calls and delegate to sub-agents.',
    link: '/agents/',
    sublinks: [
      { text: 'Messages', link: '/agents/messages' },
      { text: 'Memory', link: '/agents/memory' },
      { text: 'Streaming', link: '/agents/streaming' },
      { text: 'Approvals', link: '/agents/approvals' },
    ],
  },
  {
    title: 'Providers',
    details: 'Multiple providers behind a single interface, with per-capability defaults.',
    link: '/providers/',
    sublinks: [
      { text: 'OpenAI', link: '/providers/openai' },
      { text: 'Anthropic', link: '/providers/anthropic' },
      { text: 'OpenRouter', link: '/providers/openrouter' },
      { text: 'Gemini', link: '/providers/gemini' },
    ],
  },
  {
    title: 'Tools',
    details: 'Real PHP capabilities for agents, with human gates on sensitive calls.',
    link: '/agents/tools',
    sublinks: [
      { text: 'Provider tools', link: '/agents/provider-tools' },
      { text: 'Grouping tools', link: '/agents/toolsets' },
      { text: 'MCP tools', link: '/agents/mcp-link' },
      { text: 'Skills', link: '/agents/skills' },
    ],
  },
  {
    title: 'RAG & files',
    details: 'Stores, embeddings with reranking, and file attachments for grounded answers.',
    link: '/rag/',
    sublinks: [
      { text: 'Loading', link: '/rag/loader' },
      { text: 'Embedding', link: '/rag/embeddings' },
      { text: 'Stores', link: '/rag/store' },
      { text: 'Retrieval', link: '/rag/retrieval' },
    ],
  },
  {
    title: 'MCP',
    details: 'Expose tools, resources, and prompts over the Model Context Protocol.',
    link: '/mcp/',
    sublinks: [
      { text: 'Commands', link: '/mcp/commands' },
      { text: 'Servers', link: '/mcp/servers' },
      { text: 'Tools', link: '/mcp/tools' },
      { text: 'Clients', link: '/mcp/clients' },
    ],
  },
  {
    title: 'Getting started',
    details: 'Install crustum/cakephp-ai, configure providers and send your first prompt.',
    link: '/getting-started/',
    sublinks: [
      { text: 'MCP', link: '/mcp/' },
      { text: 'Ignis', link: '/ignis/' },
      { text: 'Panifex', link: '/panifex/getting-started' },
    ],
  },
]
</script>

<style scoped>
.ai-topics {
  background: var(--ai-bg-canvas);
}

.ai-topics-inner {
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

.ai-h2 em {
  font-family: var(--ai-font-serif);
  color: var(--ai-brand-1);
}

.ai-lede {
  margin: 12px 0 0;
  max-width: 720px;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: var(--ai-text-subtle);
}

.ai-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 55px;
}

.ai-topic {
  display: flex;
  flex-direction: column;
  min-height: 360px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid var(--ai-border-soft);
  border-radius: var(--ai-radius-md);
  transition: transform 0.25s, background 0.25s, box-shadow 0.25s;
}

.ai-topic:hover {
  background: #fff;
  border-color: var(--ai-border-subtle);
  box-shadow: 0 18px 45px rgba(53, 46, 34, 0.09);
  transform: translateY(-6px);
}

.ai-topic-main {
  display: block;
  text-decoration: none;
}

.ai-topic-main:hover {
  text-decoration: none;
}

.ai-topic-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-chip) * var(--ai-font-scale, 1));
  color: var(--ai-text-soft);
}

.ai-h3 {
  margin: 45px 0 0;
  font-size: calc(var(--ai-fs-h3-card) * var(--ai-font-scale, 1));
  letter-spacing: -0.04em;
  color: var(--ai-text-primary);
}

.ai-topic-desc {
  margin: 12px 0 0;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-body);
  color: var(--ai-text-subtle);
}

.ai-topic-open {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  font-weight: 600;
  color: var(--ai-brand-1);
}

.ai-topic-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.ai-topic-sub a {
  display: inline-block;
  padding: 6px 8px;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-decoration: none;
  color: var(--ai-text-weak);
  background: var(--ai-bg-weak);
  border-radius: 5px;
}

.ai-topic-sub a:hover {
  text-decoration: none;
  color: var(--ai-brand-1);
}

@media (min-width: 640px) {
  .ai-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 960px) {
  .ai-topics-inner {
    padding: 125px var(--ai-gutter);
  }

  .ai-sec-head {
    grid-template-columns: 1fr 370px;
    gap: 60px;
  }

  .ai-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
