<template>
  <section class="ai-cta">
    <div class="ai-cta-inner">
      <div class="ai-cta-panel">
        <p class="ai-cta-kicker">Live demo</p>
        <h2 class="ai-cta-title">See a real agent, <em>not a mockup.</em></h2>
        <p class="ai-cta-lede">AiDemo ships a working Assistant with four tools over HTTP and console.</p>
        <div class="ai-cta-actions">
          <a class="ai-cta-primary" href="/demo/">Explore the demo <span aria-hidden="true">→</span></a>
          <a class="ai-cta-secondary" href="/getting-started/">Read the docs</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-cta {
  background: var(--ai-bg-canvas);
  border-top: 1px solid var(--ai-border-soft);
}

.ai-cta-inner {
  max-width: var(--ai-max-width);
  margin: 0 auto;
  padding: 64px var(--ai-gutter);
}

.ai-cta-panel {
  position: relative;
  overflow: clip;
  padding: 48px 36px;
  text-align: center;
  color: #f9fafb;
  background: var(--ai-bg-dark);
  border-radius: var(--ai-radius-xl);
  box-shadow: var(--ai-shadow-lg);
}

.ai-cta-panel > * {
  position: relative;
}

.ai-cta-kicker {
  margin: 0 0 12px;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-kicker) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--ai-ls-kicker);
  color: var(--ai-accent-rose-light);
}

.ai-cta-title {
  margin: 18px 0 0;
  font-size: var(--ai-fs-h2);
  line-height: var(--ai-lh-tight);
  letter-spacing: var(--ai-ls-heading);
  font-weight: 600;
}

.ai-cta-title em {
  font-family: var(--ai-font-serif);
  color: var(--ai-brand-1);
}

.ai-cta-lede {
  margin: 18px auto 0;
  max-width: 620px;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: #b9c1cf;
}

.ai-cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 28px;
}

.ai-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px 19px;
  font-size: calc(var(--ai-fs-btn) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: #101828;
  background: #fff;
  border-radius: var(--ai-radius-sm);
}

.ai-cta-secondary {
  padding: 4px 0;
  font-size: calc(var(--ai-fs-btn) * var(--ai-font-scale, 1));
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

@media (min-width: 960px) {
  .ai-cta-panel {
    padding: 96px;
  }
}
</style>
