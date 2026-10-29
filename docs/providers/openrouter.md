---
description: 'OpenRouter: the default provider, routing to many vendors.'
---

# OpenRouter

A gateway that routes one API key to models from many vendors. Use it as the
general default when you want to switch underlying models (Anthropic, Google,
OpenAI, and others) without changing provider code — model ids use the
`vendor/model` slug form. It is the default backend for text, images, audio,
transcription, embeddings, and reranking.

## Capabilities

Text with streaming, image and audio generation, transcription, embeddings,
classification, and reranking, plus file storage. Provider tools: web fetch
and web search ([details](../agents/provider-tools.md)).

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'defaultProvider' => env('AI_DEFAULT_PROVIDER', 'openrouter'),
        'providers' => [
            'openrouter' => [
                'className' => 'Crustum\Ai\Providers\OpenRouterProvider',
                'apiKey' => env('OPENROUTER_API_KEY'),
                'baseUrl' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
                'timeout' => (int)env('OPENROUTER_TIMEOUT', 120),
                'models' => [
                    'text' => env('OPENROUTER_TEXT_MODEL', 'anthropic/claude-sonnet-5.5'),
                    'embeddings' => [
                        'default' => env('OPENROUTER_EMBEDDINGS_MODEL', 'google/gemini-embedding-001'),
                        'dimensions' => (int)env('OPENROUTER_EMBEDDINGS_DIMENSIONS', 1536),
                    ],
                    'image' => env('OPENROUTER_IMAGE_MODEL'),
                    'audio' => env('OPENROUTER_AUDIO_MODEL'),
                    'transcription' => env('OPENROUTER_TRANSCRIPTION_MODEL'),
                ],
            ],
        ],
    ],
];
```

| Config key | Env var | Purpose |
|---|---|---|
| `className` | — | Provider class. Keep the default unless subclassing. |
| `apiKey` (`key` also accepted) | `OPENROUTER_API_KEY` | Key from openrouter.ai. Required. |
| `baseUrl` (`url` also accepted) | `OPENROUTER_BASE_URL` | API base URL. Change only for proxies or self-hosted gateways. |
| `timeout` | `OPENROUTER_TIMEOUT` | HTTP timeout in seconds. |
| `models.text` (string or `models.text.default`) | `OPENROUTER_TEXT_MODEL` | Chat model slug (`vendor/model`). Accepts a plain string or an array with `default` / `cheapest` / `smartest`. |
| `models.text.cheapest` | `OPENROUTER_TEXT_MODEL_CHEAPEST` | Budget slug when using the array form. |
| `models.text.smartest` | `OPENROUTER_TEXT_MODEL_SMARTEST` | Flagship slug when using the array form. |
| `models.image` | `OPENROUTER_IMAGE_MODEL` | Image model slug. Empty by default — set before generating images. |
| `models.audio` | `OPENROUTER_AUDIO_MODEL` | Text-to-speech model slug. Empty by default. |
| `models.transcription` | `OPENROUTER_TRANSCRIPTION_MODEL` | Speech-to-text model slug. Empty by default. |
| `models.embeddings.default` | `OPENROUTER_EMBEDDINGS_MODEL` | Embeddings model slug. |
| `models.embeddings.dimensions` | `OPENROUTER_EMBEDDINGS_DIMENSIONS` | Vector width. Set to the width the embeddings model produces. |
| `models.classification.default` | `OPENROUTER_CLASSIFICATION_MODEL` | Optional override; the built-in fallback is a TypeSafe-hosted model. |
| `models.reranking.default` | `OPENROUTER_RERANKING_MODEL` | Optional override; the built-in fallback is a Cohere-hosted model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Not in the default file; add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.*` value above, then the provider's built-in fallback.
Only the capabilities you actually call need a configured model.

## Notes

Reranking through OpenRouter uses a Cohere-hosted model unless overridden.
Embedding dimensions default to 1536; set `models.embeddings.dimensions`
when the model needs another width.

## See also

- [Providers](./index.md) — capability matrix
- [Reranking](./rerank.md) — ordering search results
- [Classification](./classify.md) — typed answers with probabilities
