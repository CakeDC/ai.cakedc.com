<template>
  <section class="ai-providers">
    <div class="ai-providers-inner">
      <div class="ai-providers-head">
        <div>
          <p class="ai-eyebrow">Providers</p>
          <h2>One interface. <em>Every model.</em></h2>
        </div>
        <p class="ai-providers-label">Multiple providers behind capability defaults, with OpenRouter ready out of the box.</p>
      </div>
      <ul class="ai-chips">
        <li v-for="p in providers" :key="p.name">
          <a class="ai-chip" :href="p.link">{{ p.name }}</a>
        </li>
      </ul>
      <p class="ai-providers-more">
        <a href="/providers/">Compare all providers →</a>
        <span aria-hidden="true"> · </span>
        <a href="/providers/embeddings">Embeddings</a>
        <span aria-hidden="true"> · </span>
        <a href="/providers/rerank">Reranking</a>
        <span aria-hidden="true"> · </span>
        <a href="/providers/audio">Audio</a>
        <span aria-hidden="true"> · </span>
        <a href="/providers/image">Images</a>
        <span aria-hidden="true"> · </span>
        <a href="/providers/classify">Classification</a>
      </p>
    </div>
  </section>
</template>

<script setup>
// All 17 provider pages exist under docs/providers/*.md — links verified.
const providers = [
  { name: 'OpenAI', link: '/providers/openai' },
  { name: 'Anthropic', link: '/providers/anthropic' },
  { name: 'Gemini', link: '/providers/gemini' },
  { name: 'OpenRouter', link: '/providers/openrouter' },
  { name: 'Azure OpenAI', link: '/providers/azure' },
  { name: 'OpenAI-Compatible', link: '/providers/openai-compatible' },
  { name: 'Bedrock', link: '/providers/bedrock' },
  { name: 'Cohere', link: '/providers/cohere' },
  { name: 'Mistral', link: '/providers/mistral' },
  { name: 'Groq', link: '/providers/groq' },
  { name: 'xAI', link: '/providers/xai' },
  { name: 'DeepSeek', link: '/providers/deepseek' },
  { name: 'Ollama', link: '/providers/ollama' },
  { name: 'ElevenLabs', link: '/providers/elevenlabs' },
  { name: 'VoyageAI', link: '/providers/voyageai' },
  { name: 'Jina', link: '/providers/jina' },
  { name: 'TypeSafe', link: '/providers/typesafe' },
]
</script>

<style scoped>
.ai-providers {
  background: var(--ai-bg-canvas);
}

.ai-providers-inner {
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 70px var(--ai-gutter);
  border-top: 1px solid var(--ai-border-soft);
  border-bottom: 1px solid var(--ai-border-soft);
}

.ai-providers-head {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-items: end;
  margin-bottom: 20px;
}

.ai-eyebrow {
  margin: 0;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-kicker) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--ai-ls-kicker);
  color: var(--ai-brand-1);
}

.ai-providers-head h2 {
  margin: 18px 0 0;
  font-size: var(--ai-fs-h2);
  line-height: var(--ai-lh-tight);
  letter-spacing: var(--ai-ls-heading);
  font-weight: 600;
}

.ai-providers-head h2 em {
  font-family: var(--ai-font-serif);
  color: var(--ai-brand-1);
}

.ai-providers-label {
  margin: 18px 0 0;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: var(--ai-text-subtle);
}

.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 42px 0 24px;
  padding: 0;
  list-style: none;
}

.ai-chip {
  display: inline-block;
  padding: 11px 16px;
  font-family: var(--ai-font-sans);
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: var(--ai-text-weak);
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid var(--ai-border-subtle);
  border-radius: 999px;
}

.ai-chip:hover {
  text-decoration: none;
  color: var(--ai-brand-1);
  background: #fff;
  border-color: var(--ai-border-strong);
}

.ai-providers-more {
  margin: 16px 0 0;
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  color: var(--ai-text-subtle);
}

.ai-providers-more a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--ai-brand-1);
}

@media (min-width: 960px) {
  .ai-providers-head {
    grid-template-columns: 1fr 370px;
    gap: 60px;
    align-items: center;
  }
}
</style>
