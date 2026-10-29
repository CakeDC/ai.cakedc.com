<template>
  <section class="ai-hero">
    <div class="ai-hero-inner">
      <div class="ai-hero-copy">
        <p class="ai-status"><span class="ai-pulse" aria-hidden="true"></span>Curated by CakeDC</p>
        <h1 class="ai-hero-title">Plugins and tools for <em>AI in CakePHP</em></h1>
        <p class="ai-hero-subtitle">
          The place to look when you build AI features into a CakePHP app, or use AI
          to build one. We're starting with the CakePHP AI stack, and more plugins,
          MCP servers, Claude skills and CLI tools are coming soon.
        </p>
        <div class="ai-hero-actions">
          <a class="ai-btn ai-btn-primary" href="#catalog">Browse the catalog <span aria-hidden="true">→</span></a>
          <a class="ai-btn-text" href="/getting-started/">Quickstart</a>
        </div>
      </div>
      <div class="ai-hero-panel">
        <div class="ai-panel-head">
          <div>
            <p class="ai-panel-kicker">The catalog today</p>
            <p class="ai-panel-title">{{ total }} resources, growing</p>
          </div>
          <span class="ai-panel-icon" aria-hidden="true">⌁</span>
        </div>
        <ul class="ai-type-list">
          <li v-for="t in typeCounts" :key="t.type">
            <span class="ai-type-name">{{ t.label }}</span>
            <span :class="['ai-type-count', { 'ai-type-soon': !t.count }]">{{ t.count ? t.count : 'Soon' }}</span>
          </li>
        </ul>
        <p class="ai-panel-note">
          Every entry is picked by the CakeDC team.
          <a class="ai-panel-link" :href="suggestUrl" target="_blank" rel="noopener">Suggest a resource</a>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { typeCounts, suggestUrl } from './hub-data.js'

const total = typeCounts.reduce((n, t) => n + t.count, 0)
</script>

<style scoped>
.ai-hero {
  position: relative;
  overflow: clip;
  background: var(--ai-bg-canvas);
  border-bottom: 1px solid var(--ai-border-soft);
}

.ai-hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 56px var(--ai-gutter) 64px;
}

.ai-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 24px;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-kicker) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--ai-ls-kicker);
  color: var(--ai-brand-1);
}

.ai-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #12b76a;
  box-shadow: 0 0 0 4px rgba(18, 183, 106, 0.16);
}

.ai-hero-title {
  margin: 0;
  max-width: 650px;
  font-size: var(--ai-fs-hero);
  line-height: var(--ai-lh-hero);
  letter-spacing: -0.065em;
  font-weight: 600;
  color: var(--ai-text-primary);
}

.ai-hero-title em {
  font-family: var(--ai-font-serif);
  font-style: italic;
  font-weight: 600;
  color: var(--ai-brand-1);
}

.ai-hero-subtitle {
  margin: 28px 0 0;
  max-width: 560px;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: var(--ai-text-weak);
}

.ai-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  margin-top: 34px;
}

.ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  padding: 15px 19px;
  font-size: calc(var(--ai-fs-btn) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--ai-radius-sm);
}

.ai-btn-primary {
  color: #fff;
  background: var(--ai-brand-1);
}

.ai-btn-primary:hover {
  color: #fff;
  text-decoration: none;
  background: var(--ai-brand-2);
}

.ai-btn-text {
  padding: 4px 0;
  font-size: calc(var(--ai-fs-btn) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: var(--ai-text-primary);
  border-bottom: 1px solid var(--ai-border-strong);
}

.ai-stats {
  display: flex;
  gap: 38px;
  margin: 42px 0 0;
  padding: 0;
}

.ai-stats div {
  display: flex;
  flex-direction: column;
}

.ai-stats dd {
  order: -1;
  margin: 0;
  font-size: calc(var(--ai-fs-stats) * var(--ai-font-scale, 1));
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--ai-text-primary);
}

.ai-stats dt {
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ai-text-soft);
}

.ai-hero-panel {
  overflow: hidden;
  background: var(--ai-panel-dark);
  color: #dddddd;
  border-radius: var(--ai-radius-lg);
  box-shadow: var(--ai-shadow-lg);
}

.ai-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 25px 25px 0;
}

.ai-panel-kicker {
  margin: 0;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-kicker) * var(--ai-font-scale, 1));
  text-transform: uppercase;
  letter-spacing: var(--ai-ls-kicker);
  color: var(--ai-accent-rose);
}

.ai-panel-title {
  margin: 7px 0 0;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1) + 1px);
  font-weight: 600;
  color: #fff;
}

.ai-panel-icon {
  font-size: calc(var(--ai-fs-stats) * var(--ai-font-scale, 1));
  color: var(--ai-brand-1);
}

.ai-panel-note {
  margin: 16px 0 0;
  padding: 16px 25px 24px;
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  color: var(--ai-code-subtle);
  border-top: 1px dashed var(--ai-border-dark);
}

.ai-hero-panel :deep(.ai-codeblock) {
  margin: 16px 25px 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.ai-hero-panel :deep(.ai-codebar) {
  display: flex;
  padding: 10px 0 0;
  background: transparent;
  border: none;
  border-top: 1px solid var(--ai-border-dark);
}

.ai-hero-panel :deep(.ai-codeblock:first-of-type .ai-codebar) {
  border-top: none;
}

.ai-hero-panel :deep(.ai-dots) {
  display: none;
}

.ai-hero-panel :deep(.ai-lang) {
  margin-left: 0;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--ai-code-subtle);
}

.ai-hero-panel :deep(.ai-pre) {
  padding: 4px 0 12px;
  background: transparent;
  font-size: calc(var(--ai-fs-code) * var(--ai-font-scale, 1));
}

.ai-hero-panel :deep(.ai-pre code) {
  color: var(--ai-code-fg-dark);
}

.ai-panel-note {
  margin: 0;
  padding: 0 25px 24px;
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  color: var(--ai-code-subtle);
}

.ai-panel-link {
  font-weight: 600;
  color: var(--ai-accent-pink);
}

@media (min-width: 960px) {
  .ai-hero-inner {
    grid-template-columns: 1.02fr 0.98fr;
    gap: 50px;
    padding: 88px var(--ai-gutter) 70px;
  }
}

.ai-type-list {
  margin: 0;
  padding: 8px 24px;
  list-style: none;
}

.ai-type-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 14px 0;
  border-bottom: 1px solid var(--ai-border-dark);
}

.ai-type-name {
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  color: var(--ai-text-dark);
}

.ai-type-count {
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-chip) * var(--ai-font-scale, 1));
  text-transform: uppercase;
  color: var(--ai-accent-rose-light);
}

.ai-type-soon {
  color: var(--ai-text-dark-faint);
}
</style>
