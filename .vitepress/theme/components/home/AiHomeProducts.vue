<template>
  <section class="ai-products" id="catalog">
    <div class="ai-prod-inner">
      <div class="ai-sec-head">
        <div>
          <p class="ai-kicker">The catalog</p>
          <h2 class="ai-h2">Everything we've picked <em>so far.</em></h2>
        </div>
        <p class="ai-lede">Plugins, MCP servers, Claude skills and CLI tools for CakePHP and AI, chosen by the CakeDC team.</p>
      </div>
      <ul class="ai-types">
        <li v-for="t in typeCounts" :key="t.type" :class="{ 'ai-type-empty': !t.count }">
          <span class="ai-type-label">{{ t.label }}</span>
          <span class="ai-type-blurb">{{ t.blurb }}</span>
          <span class="ai-type-status">{{ t.count ? t.count + ' listed' : 'Coming soon' }}</span>
        </li>
      </ul>
      <div class="ai-list">
        <article v-for="p in plugins" :key="p.slug" class="ai-row">
          <span class="ai-cat">{{ p.category }}</span>
          <div>
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
      <p class="ai-soon">
        This is the first batch. More plugins, MCP servers, skills and CLI tools are coming soon.
        <a :href="suggestUrl" target="_blank" rel="noopener">Suggest a resource →</a>
      </p>
    </div>
  </section>
</template>

<script setup>
import { resources, typeCounts, suggestUrl } from './hub-data.js'

const plugins = resources.filter((r) => r.type === 'plugin')
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
  margin-top: 48px;
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

.ai-h2 em {
  font-family: var(--ai-font-serif);
  color: var(--ai-brand-1);
}

.ai-types {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
}

.ai-types li {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 24px;
  background: var(--ai-bg-primary);
  border: 1px solid var(--ai-border-soft);
  border-radius: var(--ai-radius-md);
}

.ai-type-empty {
  background: transparent;
  border-style: dashed;
}

.ai-type-label {
  font-size: calc(var(--ai-fs-h3-row) * var(--ai-font-scale, 1));
  font-weight: 600;
  color: var(--ai-text-primary);
}

.ai-type-blurb {
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  color: var(--ai-text-weak);
}

.ai-type-status {
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  text-transform: uppercase;
  color: var(--ai-success);
}

.ai-type-empty .ai-type-status {
  color: var(--ai-text-soft);
}

.ai-soon {
  margin: 32px 0 0;
  padding: 20px 24px;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  color: var(--ai-text-weak);
  background: var(--ai-bg-weak);
  border-radius: var(--ai-radius-md);
}

.ai-soon a {
  margin-left: 8px;
  font-weight: 600;
  color: var(--ai-brand-1);
}

@media (min-width: 960px) {
  .ai-types {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
