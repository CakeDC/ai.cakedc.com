---
title: Getting Started
description: Install crustum/cakephp-ai and configure your first provider.
---

# Getting Started

## Requirements

- PHP >= 8.4
- CakePHP ^5.4

## Installation

```bash
composer require crustum/cakephp-ai
```

## Configuration

Copy the default config to `config/ai.php`. The top-level key is `Ai`:

```php
return [
    'Ai' => [
        // Environment: AI_DEFAULT_PROVIDER, default 'openrouter'
        'defaultProvider' => 'openrouter',
    ],
];
```

The default provider is **OpenRouter**. Per-capability defaults ship in the same file:

| Capability | Default |
|---|---|
| Images, audio, transcription, embeddings, reranking | `openrouter` |
| Classification | `typesafe` |
| Stores, files | `openai` |

Each provider entry carries its credentials and timeouts (`key`/`apiKey`, `url`/`baseUrl`, `timeout`, `models`). Provider-specific keys exist where the API demands them: Azure deployments, Bedrock region and credentials, the Anthropic version header.

## Next steps

- [Providers](/providers/) — the 17 providers behind one interface
- [Agents](/agents/) — prompt, stream, remember, delegate
