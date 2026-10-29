<template>
  <section class="ai-goals" id="start">
    <div class="ai-goals-inner">
      <p class="ai-kicker">Start here</p>
      <h2 class="ai-h2">What are you <em>building?</em></h2>
      <div class="ai-goal-grid">
        <article v-for="g in goals" :key="g.title" class="ai-goal">
          <h3 class="ai-h3"><a :href="g.link">{{ g.title }}</a></h3>
          <p class="ai-goal-text">{{ g.text }}</p>
          <p class="ai-goal-picks">
            <a v-for="p in g.picks" :key="p.name" :href="p.link">{{ p.name }}</a>
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { goals } from './hub-data.js'
</script>

<style scoped>
.ai-goals {
  background: var(--ai-bg-canvas);
  border-bottom: 1px solid var(--ai-border-soft);
}

.ai-goals-inner {
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

.ai-goal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 40px;
}

.ai-goal {
  display: flex;
  flex-direction: column;
  padding: 28px;
  background: var(--ai-bg-primary);
  border: 1px solid var(--ai-border-soft);
  border-radius: var(--ai-radius-lg);
  box-shadow: var(--ai-shadow-xs);
}

.ai-h3 {
  margin: 0;
  font-size: calc(var(--ai-fs-h3-card) * var(--ai-font-scale, 1));
  font-weight: 600;
}

.ai-h3 a {
  color: var(--ai-text-primary);
  text-decoration: none;
}

.ai-h3 a:hover {
  color: var(--ai-brand-1);
}

.ai-goal-text {
  margin: 12px 0 20px;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-body);
  color: var(--ai-text-weak);
}

.ai-goal-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: auto 0 0;
}

.ai-goal-picks a {
  padding: 4px 12px;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-chip) * var(--ai-font-scale, 1));
  text-decoration: none;
  color: var(--ai-text-subtle);
  background: var(--ai-bg-weak);
  border-radius: 999px;
}

.ai-goal-picks a:hover {
  color: var(--ai-brand-1);
}

@media (min-width: 960px) {
  .ai-goals-inner {
    padding: 96px var(--ai-gutter);
  }

  .ai-goal-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
