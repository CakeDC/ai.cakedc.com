<template>
  <figure class="ai-codeblock" :class="{ 'ai-dark': dark }">
    <figcaption v-if="label" class="ai-codebar" aria-hidden="true">
      <span class="ai-dots"><i></i><i></i><i></i></span>
      <span class="ai-lang">{{ label }}</span>
    </figcaption>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <pre class="ai-pre"><code v-html="highlighted"></code></pre>
  </figure>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  lang: {
    type: String,
    default: 'bash',
  },
  title: {
    type: String,
    default: '',
  },
  dark: {
    type: Boolean,
    default: false,
  },
})

const label = computed(() => props.title || props.lang)

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Minimal github-light style highlighting (bash + php only).
// Tokenizer runs on escaped text with placeholder swaps to avoid nesting.
function highlightBash(src) {
  const esc = escapeHtml(src)
  const lines = esc.split('\n')

  return lines
    .map((line) => {
      if (!line.trim()) {
        return ''
      }

      const m = line.match(/^(\s*)([^\s]+)(.*)$/)
      if (!m) {
        return line
      }

      const [, indent, cmd, rest] = m
      const restH = rest
        .replace(/('[^']*')/g, '<span class="tok-str">$1</span>')
        .replace(/(--[a-zA-Z0-9-]+)/g, '<span class="tok-flag">$1</span>')

      if (cmd.startsWith('#')) {
        return `<span class="tok-com">${line}</span>`
      }

      return `${indent}<span class="tok-cmd">${cmd}</span>${restH}`
    })
    .join('\n')
}

function highlightPhp(src) {
  const esc = escapeHtml(src)
  const store = []
  const stash = (html) => {
    store.push(html)

    return `\u0000${store.length - 1}\u0000`
  }

  let s = esc
    .replace(
      /(\/\/[^\n]*)/g,
      (m) => stash(`<span class="tok-com">${m}</span>`),
    )
    .replace(
      /('(?:[^'\\]|\\.)*')/g,
      (m) => stash(`<span class="tok-str">${m}</span>`),
    )
    .replace(
      /\b(return|require|use|new|true|false|null)\b/g,
      (m) => stash(`<span class="tok-kw">${m}</span>`),
    )
    .replace(
      /(&#039;|=&gt;|=>)/g,
      (m) => stash(`<span class="tok-punc">${m}</span>`),
    )

  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => store[Number(i)])

  return s
}

const highlighted = computed(() =>
  props.lang === 'php' ? highlightPhp(props.code) : highlightBash(props.code),
)
</script>

<style scoped>
.ai-codeblock {
  margin: 14px 0 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--ai-border-soft);
  border-radius: var(--ai-radius-md);
  box-shadow: var(--ai-shadow-xs);
}

.ai-codebar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--ai-bg-weak);
  border-bottom: 1px solid var(--ai-border-soft);
}

.ai-dots {
  display: inline-flex;
  gap: 6px;
}

.ai-dots i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--ai-border-subtle);
}

.ai-dots i:first-child {
  background: var(--ai-brand-1);
}

.ai-lang {
  margin-left: auto;
  font-size: calc(var(--ai-fs-chip) * var(--ai-font-scale, 1));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ai-text-soft);
}

.ai-pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background: #fff;
  font-size: calc(var(--ai-fs-code) * var(--ai-font-scale, 1));
  line-height: 1.65;
  tab-size: 4;
}

.ai-pre code {
  font-family: var(--ai-font-mono);
  color: #24292f;
  white-space: pre;
  background: transparent;
}

.ai-codeblock.ai-dark {
  margin: 8px 0 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.ai-codeblock.ai-dark .ai-pre {
  background: transparent;
}
</style>

<style>
/*
 * Token colors live here (unscoped): v-html spans carry no scoped
 * data attributes, so scoped rules never match them.
 */
.ai-codeblock .tok-com {
  color: #6e7781;
  font-style: italic;
}

.ai-codeblock .tok-str {
  color: #0a3069;
}

.ai-codeblock .tok-kw {
  color: #cf222e;
}

.ai-codeblock .tok-punc {
  color: #8250df;
}

.ai-codeblock .tok-cmd {
  color: #0550ae;
  font-weight: 600;
}

.ai-codeblock .tok-flag {
  color: #953800;
}

.ai-codeblock.ai-dark .ai-pre code {
  color: #f2f4f7;
}

.ai-codeblock.ai-dark .tok-com {
  color: #b6bcc4;
  font-style: italic;
}

.ai-codeblock.ai-dark .tok-str {
  color: #ffd6da;
}

.ai-codeblock.ai-dark .tok-kw {
  color: #ff9aa5;
}

.ai-codeblock.ai-dark .tok-punc {
  color: #d6c2ff;
}

.ai-codeblock.ai-dark .tok-cmd {
  color: #ffffff;
  font-weight: 600;
}

.ai-codeblock.ai-dark .tok-flag {
  color: #fec9a6;
}
</style>
