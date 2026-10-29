<template>
  <section class="ai-capabilities">
    <div class="ai-cap-inner">
      <div class="ai-sec-head">
        <div>
          <p class="ai-kicker">Platform</p>
          <h2 class="ai-h2">Everything an agent needs, <em>across the stack.</em></h2>
        </div>
        <p class="ai-lede">Core agents, MCP and Ignis share streaming, queueing, broadcasting, failover, usage tracking and events.</p>
      </div>
      <div class="ai-list">
        <a
          v-for="(cap, i) in capabilities"
          :key="cap.title"
          class="ai-row"
          :href="cap.link"
        >
          <span class="ai-index">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="ai-h3">{{ cap.title }}</h3>
          <p class="ai-row-text">{{ cap.text }}</p>
          <span class="ai-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
// Every link below is an existing docs page (verified against docs/).
const capabilities = [
  {
    title: 'Agents',
    text: 'Conversational agents with tools, sub-agents, middleware, approvals and database-backed conversation storage.',
    link: '/agents/',
  },
  {
    title: 'MCP',
    text: 'Expose tools, resources, and prompts over the Model Context Protocol, served over web or STDIO with named clients, OAuth and interactive apps.',
    link: '/mcp/',
  },
  {
    title: 'Ignis',
    text: 'Guidelines, skills, and a live MCP server that teach coding agents your application, plus project rules that keep what it learns.',
    link: '/ignis/',
  },
  {
    title: 'Structured output',
    text: 'JSON-schema-driven answers via the json-schema plugin, including nested objects and arrays.',
    link: '/agents/structured-output',
  },
  {
    title: 'Files & stores',
    text: 'File handling, Flysystem storage and vector stores with similarity search for RAG flows.',
    link: '/rag/store',
  },
  {
    title: 'Images & audio',
    text: 'Image generation, speech synthesis and transcription behind per-capability provider defaults.',
    link: '/providers/image',
  },
  {
    title: 'Embeddings & rerank',
    text: 'Cached embeddings with multimodal and per-query support, plus reranking including collections.',
    link: '/providers/embeddings',
  },
]
</script>

<style scoped>
.ai-capabilities {
  background: var(--ai-bg-dark);
  color: var(--ai-text-dark);
}

.ai-cap-inner {
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
  color: var(--ai-accent-rose);
}

.ai-h2 {
  margin: 18px 0 0;
  font-size: var(--ai-fs-h2);
  line-height: var(--ai-lh-tight);
  letter-spacing: var(--ai-ls-heading);
  font-weight: 600;
  color: var(--ai-text-dark);
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
  color: var(--ai-text-dark-subtle);
}

.ai-list {
  margin-top: 60px;
  border-top: 1px solid var(--ai-border-dark);
}

.ai-row {
  display: grid;
  grid-template-columns: 55px 220px 1fr 30px;
  gap: 20px;
  align-items: center;
  padding: 24px 0;
  text-decoration: none;
  color: var(--ai-text-dark);
  border-bottom: 1px solid var(--ai-border-dark);
}

.ai-row:hover {
  text-decoration: none;
}

.ai-row:hover .ai-h3 {
  color: var(--ai-brand-1);
}

.ai-index {
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-chip) * var(--ai-font-scale, 1));
  color: var(--ai-row-index);
}

.ai-h3 {
  margin: 0;
  font-size: calc(var(--ai-fs-h3-row) * var(--ai-font-scale, 1));
  font-weight: 600;
  color: var(--ai-text-dark);
}

.ai-row-text {
  margin: 0;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-body);
  color: var(--ai-text-dark-subtle);
}

.ai-arrow {
  color: var(--ai-text-dark-subtle);
}

@media (min-width: 960px) {
  .ai-cap-inner {
    padding: 110px var(--ai-gutter);
  }

  .ai-sec-head {
    grid-template-columns: 1fr 370px;
    gap: 60px;
  }
}

@media (max-width: 860px) {
  .ai-row {
    grid-template-columns: 40px 1fr 30px;
  }

  .ai-row-text {
    grid-column: 2 / 4;
  }
}
</style>
