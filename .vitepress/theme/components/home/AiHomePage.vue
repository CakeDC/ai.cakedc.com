<template>
  <div class="ai-home">
    <header class="ai-topbar">
      <div class="ai-topbar-inner">
        <a class="ai-brand" href="/">
          <img src="/logo.svg" alt="CakePHP AI" width="31" height="31" />
          <span class="ai-brand-text">CakePHP <span class="ai-brand-muted">AI</span></span>
        </a>
        <nav class="ai-nav">
          <a href="/getting-started/">Getting Started</a>
          <a href="/agents/">Agents</a>
          <a href="/providers/">Providers</a>
          <a href="/rag/">RAG</a>
          <a href="/panifex/">Panifex</a>
          <a href="https://github.com/Crustum/cakephp-ai" target="_blank" rel="noopener">GitHub</a>
        </nav>
        <a class="ai-gh" href="/getting-started/">Read the docs <span aria-hidden="true">→</span></a>
      </div>
    </header>
    <main>
      <AiHomeHero />
      <AiHomeProviders />
      <AiHomeTopics />
      <AiHomeCapabilities />
      <AiHomeProducts />
      <AiHomeInterfaces />
      <AiHomeCta />
    </main>
    <footer class="ai-footer">
      <div class="ai-footer-inner">
        <p>Released under the MIT License.</p>
        <p>Copyright © 2008-2026 Evgeny Tomenko</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AiHomeHero from './AiHomeHero.vue'
import AiHomeProviders from './AiHomeProviders.vue'
import AiHomeTopics from './AiHomeTopics.vue'
import AiHomeCapabilities from './AiHomeCapabilities.vue'
import AiHomeProducts from './AiHomeProducts.vue'
import AiHomeInterfaces from './AiHomeInterfaces.vue'
import AiHomeCta from './AiHomeCta.vue'
</script>

<style>
/*
 * Design tokens: single source of truth for the home page.
 * Type scale, colors, radii, layout. Children reference vars only.
 */
.ai-home {
  --ai-font-scale: 1;

  --ai-brand-1: #e73548;
  --ai-brand-2: #c42132;
  --ai-accent-rose: #f06b79;
  --ai-accent-rose-light: #fda29b;
  --ai-accent-pink: #ff7886;
  --ai-success: #4d9d6f;
  --ai-row-index: #e85a69;

  --ai-bg-canvas: #f6f2e9;
  --ai-bg-primary: #ffffff;
  --ai-bg-weak: #ece8df;
  --ai-bg-dark: #1c1c1d;
  --ai-bg-card-dark: #242426;
  --ai-bg-code-dark: #181819;
  --ai-panel-dark: #1b1c20;

  --ai-text-primary: #171718;
  --ai-text-weak: #4c4a46;
  --ai-text-subtle: #6b6862;
  --ai-text-soft: #8a867f;
  --ai-text-dark: #f5f1e8;
  --ai-text-dark-subtle: #a8a8ad;
  --ai-text-dark-faint: #8f8f92;
  --ai-code-subtle: #8f9196;
  --ai-code-fg-dark: #e6e6e6;

  --ai-border-soft: #d9d4c9;
  --ai-border-subtle: #d6d1c7;
  --ai-border-strong: #a9a49b;
  --ai-border-dark: #3b3b3d;

  --ai-shadow-xs: 0 1px 2px rgba(43, 34, 29, 0.06);
  --ai-shadow-lg: 0 30px 60px rgba(43, 34, 29, 0.18);

  --ai-max-width: 1200px;
  --ai-gutter: max(24px, 5%);
  --ai-radius-sm: 9px;
  --ai-radius-md: 12px;
  --ai-radius-lg: 15px;
  --ai-radius-xl: 20px;

  --ai-font-sans: 'Manrope', 'Raleway', system-ui, sans-serif;
  --ai-font-mono: 'DM Mono', ui-monospace, Menlo, monospace;
  --ai-font-serif: 'Playfair Display', Georgia, serif;

  --ai-fs-brand: 20px;
  --ai-fs-nav: 15px;
  --ai-fs-btn: 15px;
  --ai-fs-kicker: 15px;
  --ai-fs-lede: 18px;
  --ai-fs-body: 16px;
  --ai-fs-small: 14px;
  --ai-fs-chip: 13px;
  --ai-fs-tag: 12px;
  --ai-fs-code: 14px;
  --ai-fs-h2: clamp(40px, 5vw, 64px);
  --ai-fs-hero: clamp(48px, 5vw, 70px);
  --ai-fs-h3-card: 24px;
  --ai-fs-h3-row: 20px;
  --ai-fs-h3-panel: 22px;
  --ai-fs-stats: 24px;

  --ai-lh-tight: 1.05;
  --ai-lh-hero: 0.98;
  --ai-lh-body: 1.7;
  --ai-lh-lede: 1.8;
  --ai-ls-heading: -0.055em;
  --ai-ls-kicker: 0.16em;

  margin: 0;
  width: 100%;
  background: var(--ai-bg-canvas);
  color: var(--ai-text-primary);
  font-family: var(--ai-font-sans);
  font-size: var(--ai-fs-body);
  line-height: var(--ai-lh-body);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}

.ai-home h1,
.ai-home h2,
.ai-home h3 {
  font-family: var(--ai-font-sans);
}
</style>

<style scoped>
.ai-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  height: 84px;
  background: var(--ai-bg-canvas);
  border-bottom: 1px solid var(--ai-border-soft);
}

.ai-topbar-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.ai-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: calc(var(--ai-fs-brand) * var(--ai-font-scale, 1));
  font-weight: 700;
  letter-spacing: -0.05em;
  text-decoration: none;
  color: var(--ai-text-primary);
}

.ai-brand img {
  border-radius: 8px;
  box-shadow: 0 5px 12px rgba(211, 60, 67, 0.18);
}

.ai-brand-text {
  line-height: 1.2;
  color: var(--ai-text-primary);
}

.ai-brand-muted {
  font-weight: 500;
  color: var(--ai-text-soft);
}

.ai-nav {
  display: flex;
  gap: 36px;
  margin-left: auto;
}

.ai-nav a {
  font-size: calc(var(--ai-fs-nav) * var(--ai-font-scale, 1));
  font-weight: 700;
  text-decoration: none;
  color: var(--ai-text-weak);
}

.ai-nav a:hover {
  color: var(--ai-brand-1);
}

.ai-gh {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  background: var(--ai-text-primary);
  border-radius: 999px;
  transition: transform 0.2s, background 0.2s;
}

.ai-gh:hover {
  color: #fff;
  text-decoration: none;
  background: var(--ai-brand-1);
  transform: translateY(-2px);
}

.ai-footer {
  background: var(--ai-bg-canvas);
  border-top: 1px solid var(--ai-border-soft);
}

.ai-footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  justify-content: space-between;
  align-items: center;
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 40px var(--ai-gutter);
}

.ai-footer p {
  margin: 0;
  font-size: calc(var(--ai-fs-nav) * var(--ai-font-scale, 1));
  color: var(--ai-text-soft);
}

@media (max-width: 860px) {
  .ai-nav {
    display: none;
  }

  .ai-gh {
    margin-left: auto;
  }
}
</style>
