// Hub catalog data for the home page. Entries mirror .vitepress/plugins-config.js
// and link to existing pages only. `type` drives the resource-type tiles; a type
// with no entries renders as "Soon". `isNew: true` shows a "New" badge on the row.
const org = 'https://github.com/crustum'

export const suggestUrl = 'https://github.com/CakeDC/ai.cakedc.com/issues/new?title=Suggest+a+resource'

export const resourceTypes = [
  { type: 'plugin', label: 'Plugins', blurb: 'CakePHP plugins for agents, search, UI and tooling.' },
  { type: 'mcp-server', label: 'MCP servers', blurb: 'Servers that expose CakePHP apps and data to AI clients.' },
  { type: 'skill', label: 'Claude skills', blurb: 'Reusable skills that teach coding agents CakePHP.' },
  { type: 'cli-tool', label: 'CLI tools', blurb: 'Command-line helpers for AI work on CakePHP projects.' },
]

export const goals = [
  {
    title: 'Add an AI agent to my app',
    text: 'Agents, tools, structured output and search over your own data.',
    link: '/getting-started/',
    picks: [{ name: 'CakePHP AI', link: '/getting-started/' }, { name: 'Explorator', link: '/rag/' }],
  },
  {
    title: 'Expose my app to AI tools',
    text: 'Serve tools and resources to MCP clients and coding assistants.',
    link: '/mcp/',
    picks: [{ name: 'MCP', link: '/mcp/' }, { name: 'Ignis', link: '/ignis/' }],
  },
  {
    title: 'Code faster with AI',
    text: 'Guidelines, harnesses and, soon, skills that teach agents your codebase.',
    link: '/ignis/',
    picks: [{ name: 'Ignis', link: '/ignis/' }, { name: 'Panifex', link: '/panifex/' }],
  },
]

export const resources = [
  {
    slug: 'ai', type: 'plugin', title: 'CakePHP AI', composer: 'crustum/cakephp-ai', category: 'core',
    details: 'Unified API for 17 AI providers: agents with tools and sub-agents, structured output, images, audio, transcription, embeddings with reranking, streaming, queueing and broadcasting.',
    link: '/getting-started/', github: 'https://github.com/Crustum/cakephp-ai',
  },
  {
    slug: 'interaction', type: 'plugin', title: 'AiInteraction', composer: 'crustum/ai-interaction', category: 'core',
    details: 'UI-agnostic interaction primitives: turn runner, slash commands, sessions with titles, input history, per-user preferences and a response-stop contract.',
    link: '/interaction/', github: org,
  },
  {
    slug: 'tui', type: 'plugin', title: 'AiTui', composer: 'crustum/ai-tui', category: 'terminal',
    details: 'Fastest way in: terminal chat with any agent via a single ai chat command with key bindings, input recall and tool-call cards on AiInteraction turns.',
    link: '/interaction/tui', github: org,
  },
  {
    slug: 'nexus', type: 'plugin', title: 'AiNexus', composer: 'crustum/ai-nexus', category: 'web',
    details: 'Web dashboard and playground for agents: discovery, streaming chat, attachments and retention.',
    link: '/debugger/index', github: org,
  },
  {
    slug: 'panifex', type: 'plugin', title: 'Panifex', composer: 'crustum/panifex', category: 'harness',
    details: 'CakePHP harness for coding agents: autonomous runs, terminal UI, web chat-ops and other channels, plus 14 agent variants, 35 tools, guards and healing.',
    link: '/panifex/', github: org,
  },
  {
    slug: 'mcp', type: 'plugin', title: 'MCP', composer: 'crustum/mcp', category: 'protocol',
    details: 'Model Context Protocol servers and clients for CakePHP: tools, resources, and prompts over HTTP or STDIO, OAuth via Tessera, and interactive MCP Apps.',
    link: '/mcp/', github: 'https://github.com/Crustum/mcp',
  },
  {
    slug: 'ignis', type: 'plugin', title: 'Ignis', composer: 'crustum/ignis', category: 'dev',
    details: 'Coding-assistant toolkit: composed guidelines, on-demand skills, a live MCP server, and project rules that teach agents your application.',
    link: '/ignis/', github: 'https://github.com/Crustum/ignis',
  },
  {
    slug: 'explorator', type: 'plugin', title: 'Explorator', composer: 'crustum/explorator', category: 'search',
    details: 'Full-text and vector search for CakePHP: collection, database, Algolia, Meilisearch, and Typesense drivers with RAG-ready embeddings.',
    link: '/rag/', github: 'https://github.com/Crustum/explorator',
  },
  {
    slug: 'demo', type: 'plugin', title: 'AiDemo', composer: 'cakephp/app skeleton', category: 'demo',
    details: 'Runnable demo application: an Assistant agent with four tools (weather, location, temperature conversion, approval-gated email) over HTTP and console.',
    link: '/demo/', github: org,
  },
  {
    slug: 'cakedc-mcp', type: 'mcp-server', isNew: true, title: 'CakeDC MCP', composer: 'cakedc/cakephp-mcp', category: 'protocol',
    details: 'MCP server for CakePHP: mark methods in your application with an attribute to expose them to MCP clients, run through the bundled mcp-server binary. Early stage, README is still a stub.',
    link: null, github: 'https://github.com/CakeDC/cakephp-mcp',
  },
  {
    slug: 'synapse', type: 'mcp-server', title: 'Synapse', composer: 'josbeir/cakephp-synapse', category: 'protocol',
    details: 'Community MCP server plugin for CakePHP 5.2+, meant as a development dependency. Built-in tools for database schema, routes, logs, cache and ORM introspection, full-text search of the CakePHP docs, and attribute-based custom tools, resources and prompts. MIT, pre-1.0.',
    link: null, github: 'https://github.com/josbeir/cakephp-synapse',
  },
]

export const typeCounts = resourceTypes.map((t) => ({
  ...t,
  count: resources.filter((r) => r.type === t.type).length,
}))
