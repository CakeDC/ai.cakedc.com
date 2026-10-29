/**
 * Central products configuration
 * Only real workspace plugins are listed. No sponsors,
 * no invented products or links. Entries without a verified GitHub
 * URL use `githubUrl: null` and fall back to the org profile link.
 *
 * Order matters: the first RECENT_PLUGINS_COUNT entries (see constants.js)
 * appear as "recent" on the home page.
 */
export const pluginsConfig = [
  {
    title: 'CakePHP AI',
    details: 'Unified API for 17 AI providers: agents with tools and sub-agents, structured output, images, audio, transcription, embeddings with reranking, streaming, queueing and broadcasting.',
    link: '/getting-started/',
    name: 'Ai',
    githubUrl: 'https://github.com/Crustum/cakephp-ai'
  },
  {
    title: 'AiInteraction',
    details: 'UI-agnostic interaction primitives: turn runner, slash commands, sessions with titles, input history, per-user preferences and a response-stop contract.',
    link: '/interaction/',
    name: 'AiInteraction',
    githubUrl: null
  },
  {
    title: 'AiTui',
    details: 'Fastest way in: terminal chat with any agent via a single ai chat command — key bindings, input recall and tool-call cards on AiInteraction turns.',
    link: '/interaction/tui',
    name: 'AiTui',
    githubUrl: null
  },
  {
    title: 'AiNexus',
    details: 'Web dashboard and playground for agents: discovery, streaming chat, attachments and retention. Early stage — configuration reference only for now.',
    link: '/debugger/index',
    name: 'AiNexus',
    githubUrl: 'https://github.com/Crustum/ai-nexus'
  },
  {
    title: 'Panifex',
    details: 'CakePHP harness for coding agents: autonomous runs, terminal UI, web chat-ops and other channels, plus 14 agent variants, 35 tools, guards and healing.',
    link: '/panifex/',
    name: 'Panifex',
    githubUrl: 'https://github.com/Crustum/panifex'
  },
  {
    title: 'MCP',
    details: 'Model Context Protocol servers and clients for CakePHP: tools, resources, and prompts over HTTP or STDIO, OAuth via Tessera, and interactive MCP Apps.',
    link: '/mcp/',
    name: 'Mcp',
    githubUrl: 'https://github.com/Crustum/mcp'
  },
  {
    title: 'Ignis',
    details: 'Coding-assistant toolkit: composed guidelines, on-demand skills, a live MCP server, and project rules that teach agents your application.',
    link: '/ignis/',
    name: 'Ignis',
    githubUrl: 'https://github.com/Crustum/ignis'
  },
  {
    title: 'Explorator',
    details: 'Full-text and vector search for CakePHP: collection, database, Algolia, Meilisearch, and Typesense drivers with RAG-ready embeddings.',
    link: '/rag/',
    name: 'Explorator',
    githubUrl: 'https://github.com/Crustum/explorator'
  },
  {
    title: 'AiDemo',
    details: 'Runnable demo application: an Assistant agent with four tools (weather, location, temperature conversion, approval-gated email) over HTTP and console.',
    link: '/demo/',
    name: 'AiDemo',
    githubUrl: null
  }
]
