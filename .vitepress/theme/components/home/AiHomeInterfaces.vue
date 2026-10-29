<template>
  <section class="ai-interfaces">
    <div class="ai-if-inner">
      <div class="ai-sec-head">
        <div>
          <p class="ai-kicker">Interfaces</p>
          <h2 class="ai-h2">Talk to agents anywhere.</h2>
        </div>
        <p class="ai-lede">The same driver agent, in your terminal or behind purpose-built coding commands.</p>
      </div>
      <div class="ai-two">
        <article class="ai-panel">
          <p class="ai-kicker">In the terminal</p>
          <h3 class="ai-h3">Quick anonymous chat</h3>
          <AiCode :code="tuiCmd" lang="bash" title="terminal" dark />
          <p class="ai-panel-text">No agent to configure. If it answers, the provider connection is good.</p>
          <p class="ai-panel-cta"><a href="/interaction/tui">Terminal chat →</a></p>
        </article>
        <article class="ai-panel">
          <p class="ai-kicker">With a coding agent</p>
          <h3 class="ai-h3">Panifex coder commands</h3>
          <AiCode :code="panifexCmd" lang="bash" title="terminal" dark />
          <p class="ai-panel-text">Tools for file edits, tests, static analysis and database inspection.</p>
          <p class="ai-panel-cta"><a href="/panifex/getting-started">Panifex getting started →</a></p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import AiCode from './AiCode.vue'

const tuiCmd = `bin/cake ai chat --prompt "Tell me about CakePHP"`
const panifexCmd = `bin/cake coder review
bin/cake coder test
bin/cake coder fix`
</script>

<style scoped>
.ai-interfaces {
  background: var(--ai-bg-dark);
  color: var(--ai-text-dark);
}

.ai-if-inner {
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

.ai-lede {
  margin: 12px 0 0;
  font-size: calc(var(--ai-fs-lede) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-lede);
  color: var(--ai-text-dark-subtle);
}

.ai-two {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 55px;
}

.ai-panel {
  padding: 35px;
  background: var(--ai-bg-card-dark);
  border: 1px solid var(--ai-border-dark);
  border-radius: var(--ai-radius-md);
}

.ai-h3 {
  margin: 16px 0 0;
  font-size: calc(var(--ai-fs-h3-panel) * var(--ai-font-scale, 1));
  font-weight: 600;
  color: var(--ai-text-dark);
}

.ai-panel :deep(.ai-codeblock) {
  margin: 24px 0 0;
  padding: 0 20px 20px;
  background: var(--ai-bg-code-dark);
  border: none;
  border-radius: var(--ai-radius-sm);
}

.ai-panel :deep(.ai-codebar) {
  display: flex;
  padding: 16px 0 0;
  background: transparent;
  border: none;
}

.ai-panel :deep(.ai-dots) {
  display: none;
}

.ai-panel :deep(.ai-lang) {
  margin-left: 0;
  font-family: var(--ai-font-mono);
  font-size: calc(var(--ai-fs-tag) * var(--ai-font-scale, 1));
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--ai-code-subtle);
}

.ai-panel :deep(.ai-pre) {
  padding: 0;
  font-size: calc(var(--ai-fs-code) * var(--ai-font-scale, 1));
}

.ai-panel-text {
  margin: 16px 0 0;
  font-size: calc(var(--ai-fs-body) * var(--ai-font-scale, 1));
  line-height: var(--ai-lh-body);
  color: var(--ai-text-dark-subtle);
}

.ai-panel-cta {
  margin: 12px 0 0;
  font-size: calc(var(--ai-fs-small) * var(--ai-font-scale, 1));
  font-weight: 600;
}

.ai-panel-cta a {
  color: var(--ai-brand-1);
}

@media (min-width: 960px) {
  .ai-if-inner {
    padding: 100px var(--ai-gutter) 110px;
  }

  .ai-sec-head {
    grid-template-columns: 1fr 370px;
    gap: 60px;
  }

  .ai-two {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
