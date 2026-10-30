import { defineConfig } from 'vitepress'
import { mermaidPlugin } from './plugins/mermaid-simple.js'
import { pluginsPlugin, generatePluginsMetadata, getPluginsMetadata, getPluginsConfig } from './plugins/plugins.js'
import { RECENT_PLUGINS_COUNT } from './constants.js'

// Generate plugins metadata on config load
const plugins = generatePluginsMetadata(RECENT_PLUGINS_COUNT)

export default defineConfig({
    srcDir: 'docs',
    base: '/', // Standalone site with its own domain/Pages repo
    title: 'CakePHP AI',
    description: 'Agentic AI for CakePHP applications',
    ignoreDeadLinks: true,
    sitemap: {
        hostname: 'https://ai.cakedc.com/'
    },
    head: [
        ['link', { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' }],
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' }],
        ['link', { rel: 'shortcut icon', href: '/favicon/favicon.ico' }],
        ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' }],
        ['meta', { name: 'apple-mobile-web-app-title', content: 'CakePHP AI' }],
        ['link', { rel: 'manifest', href: '/favicon/site.webmanifest' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
        ['link', { href: 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap', rel: 'stylesheet' }],
        ['link', { href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@1,600&display=swap', rel: 'stylesheet' }],
        ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@11.0.0/dist/mermaid.min.js' }],
    ['script', {}, `
      // Global variables for Mermaid
      window.mermaidOriginalContents = new Map();
      window.mermaidInitialized = false;

      function initMermaid() {
        const isDark = document.documentElement.classList.contains('dark');

        mermaid.initialize({
          startOnLoad: false, // We'll manually trigger rendering
          theme: isDark ? 'dark' : 'base',
          themeVariables: isDark ? {
            primaryBorderColor: '#2D7EA4',
          } : {
            primaryColor: '#2D7EA4',
            primaryTextColor: '#333333',
            primaryBorderColor: '#2D7EA4',
            lineColor: '#666666',
            secondaryColor: '#f8f9fa',
            tertiaryColor: '#e3f2fd',
            background: '#ffffff',
            mainBkg: '#ffffff',
            secondBkg: '#f8f9fa',
            tertiaryBkg: '#e3f2fd',
            textColor: '#333333',
            actorBkg: '#f8f9fa',
            actorBorder: '#2D7EA4',
            actorTextColor: '#333333',
            actorLineColor: '#999999',
            messageLineColor: '#666666',
            messageTextColor: '#333333',
            sectionBkgColor: '#f8f9fa',
            altSectionBkgColor: '#ffffff',
            gridColor: '#cccccc',
            section0: '#f8f9fa',
            section1: '#e3f2fd',
            section2: '#ffffff',
            section3: '#f8f9fa'
          },
          securityLevel: 'loose',
          logLevel: 'error'
        });
        window.mermaidInitialized = true;
      }

      function renderMermaidDiagrams() {
        if (!window.mermaidInitialized) {
          initMermaid();
        }

        // Store original content and render diagrams
        document.querySelectorAll('.mermaid').forEach((el, index) => {
          if (!el.hasAttribute('data-processed')) {
            window.mermaidOriginalContents.set(index, el.textContent);
            mermaid.run({ nodes: [el] });
          }
        });
      }

      function reRenderMermaidDiagrams() {
        if (!window.mermaidInitialized) {
          initMermaid();
        }

        // Clear and restore original content
        document.querySelectorAll('.mermaid').forEach((el, index) => {
          el.removeAttribute('data-processed');
          if (window.mermaidOriginalContents.has(index)) {
            el.innerHTML = window.mermaidOriginalContents.get(index);
          }
        });

        // Re-render with new theme
        mermaid.run();
      }

      // Initial load
      document.addEventListener('DOMContentLoaded', function() {
        renderMermaidDiagrams();
      });

      // Theme change observer
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            setTimeout(() => {
              reRenderMermaidDiagrams();
            }, 100);
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Expose function for VitePress navigation
      window.renderMermaidDiagrams = renderMermaidDiagrams;

      function processEdgeLabels() {
        document.querySelectorAll('.mermaid g.edgeLabel').forEach(edgeLabel => {
          const span = edgeLabel.querySelector('span');
          if (!span) {
            edgeLabel.style.display = 'none';
            return;
          }

          const spanText = span.textContent.trim();
          const pText = span.querySelector('p')?.textContent.trim() || '';
          const divText = span.querySelector('div')?.textContent.trim() || '';
          const hasContent = spanText || pText || divText;

          if (!hasContent) {
            edgeLabel.style.display = 'none';
          } else {
            edgeLabel.style.setProperty('display', 'block', 'important');

            const allElements = edgeLabel.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.style.display === 'none') {
                el.style.setProperty('display', '', 'important');
              }
            });
            if (span) {
              span.style.setProperty('display', '', 'important');
            }
          }
        });
      }

      setTimeout(processEdgeLabels, 100);
      setTimeout(processEdgeLabels, 500);
      setTimeout(processEdgeLabels, 2000);
    `]
    ],
    //rewrites: {
    //    ':version/:slug*': ':version/:slug*'
    //},
    themeConfig: {
        logo: '/logo.svg',
        // One common sidebar for every page (pydantic-style): capability
        // sections first, ecosystem pages last. No per-path trees.
        sidebar: [
            {
                text: 'Getting Started',
                collapsed: false,
                items: [
                    { text: 'Home', link: '/getting-started/' }
                ]
            },
            {
                text: 'Agents',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/agents/' },
                    { text: 'Messages', link: '/agents/messages' },
                    { text: 'Memory', link: '/agents/memory' },
                    { text: 'Structured output', link: '/agents/structured-output' },
                    { text: 'Streaming', link: '/agents/streaming' },
                    { text: 'Broadcasting', link: '/agents/broadcasting' },
                    { text: 'Queueing', link: '/agents/queueing' },
                    { text: 'Middleware', link: '/agents/middleware' },
                    {
                        text: 'Agent tools',
                        collapsed: false,
                        items: [
                            { text: 'Tools', link: '/agents/tools' },
                            { text: 'Provider tools', link: '/agents/provider-tools' },
                            { text: 'Grouping tools', link: '/agents/toolsets' },
                            { text: 'MCP tools', link: '/agents/mcp-link' }
                        ]
                    },
                    { text: 'Approvals', link: '/agents/approvals' },
                    { text: 'Sub-agents', link: '/agents/sub-agents' },
                    { text: 'Skills', link: '/agents/skills' },
                    { text: 'Testing', link: '/agents/testing' },
                    { text: 'Observability', link: '/agents/observability' },
                    { text: 'Error handling', link: '/agents/error-handling' }
                ]
            },
            {
                text: 'Providers',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/providers/' },
                    { text: 'OpenAI', link: '/providers/openai' },
                    { text: 'Anthropic', link: '/providers/anthropic' },
                    { text: 'Gemini', link: '/providers/gemini' },
                    { text: 'OpenRouter', link: '/providers/openrouter' },
                    { text: 'Azure OpenAI', link: '/providers/azure' },
                    { text: 'Bedrock', link: '/providers/bedrock' },
                    { text: 'Cohere', link: '/providers/cohere' },
                    { text: 'Mistral', link: '/providers/mistral' },
                    { text: 'Groq', link: '/providers/groq' },
                    { text: 'xAI', link: '/providers/xai' },
                    { text: 'DeepSeek', link: '/providers/deepseek' },
                    { text: 'Ollama', link: '/providers/ollama' },
                    { text: 'OpenAI-Compatible', link: '/providers/openai-compatible' },
                    { text: 'ElevenLabs', link: '/providers/elevenlabs' },
                    { text: 'VoyageAI', link: '/providers/voyageai' },
                    { text: 'Jina', link: '/providers/jina' },
                    { text: 'TypeSafe', link: '/providers/typesafe' },
                    { text: 'Audio', link: '/providers/audio' },
                    { text: 'Images', link: '/providers/image' },
                    { text: 'Embeddings', link: '/providers/embeddings' },
                    { text: 'Reranking', link: '/providers/rerank' },
                    { text: 'Classification', link: '/providers/classify' }
                ]
            },
            {
                text: 'MCP',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/mcp/' },
                    { text: 'Commands', link: '/mcp/commands' },
                    { text: 'Servers', link: '/mcp/servers' },
                    { text: 'Tools', link: '/mcp/tools' },
                    { text: 'Clients', link: '/mcp/clients' },
                    { text: 'Apps', link: '/mcp/apps' },
                    { text: 'Auth', link: '/mcp/auth' }
                ]
            },
            {
                text: 'Ignis',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/ignis/' },
                    { text: 'Commands', link: '/ignis/commands' },
                    { text: 'MCP server', link: '/ignis/mcp-server' },
                    { text: 'Guidance', link: '/ignis/guidance' }
                ]
            },
            {
                text: 'RAG',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/rag/' },
                    { text: 'Loading', link: '/rag/loader' },
                    { text: 'Embedding', link: '/rag/embeddings' },
                    { text: 'Stores', link: '/rag/store' },
                    { text: 'Retrieval', link: '/rag/retrieval' }
                ]
            },
            {
                text: 'Observability',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/observability/' }
                ]
            },
            {
                text: 'Panifex',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/panifex/' },
                    { text: 'Getting started', link: '/panifex/getting-started' },
                    { text: 'Configuration', link: '/panifex/configuration' },
                    { text: 'First session', link: '/panifex/first-session' },
                    { text: 'Project setup', link: '/panifex/project-setup' },
                    { text: 'Headless runs', link: '/panifex/sessions-run' },
                    { text: 'Focused sessions', link: '/panifex/sessions-focused' },
                    { text: 'Code review', link: '/panifex/review' },
                    { text: 'Upgrades', link: '/panifex/upgrade' },
                    { text: 'Evals', link: '/panifex/eval' },
                    { text: 'Self-healing', link: '/panifex/healing' },
                    { text: 'Tools', link: '/panifex/tools' },
                    { text: 'Extending', link: '/panifex/extending' },
                    { text: 'Safety', link: '/panifex/safety' },
                    { text: 'Chat connections', link: '/panifex/connections-chat' },
                    { text: 'Hosting connections', link: '/panifex/connections-hosting' },
                    { text: 'MCP server', link: '/panifex/mcp-server' },
                    { text: 'Reference', link: '/panifex/reference' }
                ]
            },
            {
                text: 'Debugger',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/debugger/' }
                ]
            },
            {
                text: 'Interaction',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/interaction/' },
                    { text: 'Terminal', link: '/interaction/tui' }
                ]
            },
            // {
                // text: 'Examples',
                // collapsed: false,
                // items: [
                    // { text: 'Setup', link: '/examples/setup' }
                // ]
            // },
        ],
        // end-sidebar
        // socialLinks: [
        //     { icon: 'github', link: 'https://github.com/skie' },
        // ],

        // Let's only index latest version in search to speed up indexing.
        search: {
            provider: 'local',
            options: {
                async _render(src, env, md) {
                        const html = await md.render(src, env)

                        return html
                }
            }
        },
        // editLink: {
            // pattern: 'https://github.com/skie/cakephp-plugins-docs/edit/main/:path',
            // text: 'Edit this page on GitHub'
        // },
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2025-2026'
        },
        lastUpdated: {
            text: 'Updated at',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        }
    },
    vite: {
        resolve: {
            preserveSymlinks: true
        },
        plugins: [
            pluginsPlugin(RECENT_PLUGINS_COUNT)
        ]
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'framework': ['vue']
                }
            }
        }
    },
    markdown: {
        lineNumbers: true,
        languages: ['dotenv', 'yaml'],
        languageAlias: {
            env: 'dotenv',
            neon: 'yaml'
        },
        config: (md) => {
            // Handle Mermaid code blocks
            const fence = md.renderer.rules.fence
            md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
                const token = tokens[idx]
                const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
                const langName = info ? info.split(/\s+/g)[0] : ''

                if (langName === 'mermaid') {
                    // Clean up the content and preserve line breaks
                    const content = token.content
                        .replace(/&gt;/g, '>')
                        .replace(/&lt;/g, '<')
                        .replace(/&amp;/g, '&')
                        .trim()

                    return `<pre class="mermaid">${content}</pre>`
                }

                return fence(tokens, idx, options, env, renderer)
            }
        }
    },
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav: [
                    { text: 'Getting Started', link: '/getting-started/' },
                    { text: 'Agents', link: '/agents/' },
                    { text: 'Providers', link: '/providers/' },
                    { text: 'RAG', link: '/rag/' },
                    { text: 'Workflow', link: '/workflow/' },
                    { text: 'Observability', link: '/observability/' }
                ],
            }
        }
    }
})
