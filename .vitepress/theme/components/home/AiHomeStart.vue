<template>
  <section class="ai-start">
    <div class="ai-start-inner">
      <div class="ai-start-copy">
        <p class="ai-kicker">Quickstart</p>
        <h2 class="ai-h2">Start with the <em>CakePHP AI</em> stack.</h2>
        <p class="ai-lede">
          The first plugins in the catalog give you agents, tools, structured output and
          streaming across 17 providers. Install the core plugin and you're running in minutes.
        </p>
        <div class="ai-start-actions">
          <a class="ai-start-primary" href="/getting-started/">Read the docs <span aria-hidden="true">→</span></a>
          <a class="ai-start-secondary" href="/demo/">Explore the demo</a>
        </div>
      </div>
      <div class="ai-start-panel">
        <AiCode :code="installSnippet" lang="bash" title="terminal" dark />
      </div>
    </div>
  </section>
</template>

<script setup>
import AiCode from './AiCode.vue'

const installSnippet = `composer require crustum/cakephp-ai
bin/cake plugin load Crustum/Ai
bin/cake manifest install --plugin Crustum/Ai
bin/cake migrations migrate`
</script>

<style scoped>
.ai-start {
  background: var(--ai-bg-canvas);
  border-top: 1px solid var(--ai-border-soft);
}

.ai-start-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 64px var(--ai-gutter);
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
  margin: 18px 0 0;
  max-width: 560px;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: var(--ai-text-weak);
}

.ai-start-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  margin-top: 28px;
}

.ai-start-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px 19px;
  font-size: calc(var(--ai-fs-btn) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  background: var(--ai-brand-1);
  border-radius: var(--ai-radius-sm);
}

.ai-start-primary:hover {
  color: #fff;
  background: var(--ai-brand-2);
}

.ai-start-secondary {
  padding: 4px 0;
  font-size: calc(var(--ai-fs-btn) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: var(--ai-text-primary);
  border-bottom: 1px solid var(--ai-border-strong);
}

.ai-start-panel :deep(.ai-codeblock) {
  margin: 0;
}

.ai-start-panel {
  overflow: hidden;
  background: var(--ai-panel-dark);
  border-radius: var(--ai-radius-lg);
  box-shadow: var(--ai-shadow-lg);
}

@media (min-width: 960px) {
  .ai-start-inner {
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    padding: 96px var(--ai-gutter);
  }
}
</style>
