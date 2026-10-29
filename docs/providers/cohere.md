---
description: 'Cohere: text, embeddings, and reranking.'
---

# Cohere

Cohere's platform for chat text with streaming, embeddings, and reranking.
Use it when you need a dedicated reranking backend that also serves chat and
vectors, so one key covers the retrieve-then-rerank loop.

## Capabilities

Text with streaming, embeddings, and reranking.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'cohere' => [
                'className' => 'Crustum\Ai\Providers\CohereProvider',
                'key' => env('COHERE_API_KEY'),
                'url' => env('COHERE_URL', 'https://api.cohere.com/v2'),
                'models' => [
                    'text' => [
                        'default' => env('COHERE_TEXT_MODEL', 'command-a-03-2025'),
                        'cheapest' => env('COHERE_TEXT_MODEL_CHEAPEST', 'command-r7b-12-2024'),
                        'smartest' => env('COHERE_TEXT_MODEL_SMARTEST', 'command-a-plus-05-2026'),
                    ],
                    'embeddings' => [
                        'default' => env('COHERE_EMBEDDINGS_MODEL', 'embed-v4.0'),
                        'dimensions' => (int)env('COHERE_EMBEDDINGS_DIMENSIONS', 1536),
                    ],
                    'reranking' => [
                        'default' => env('COHERE_RERANKING_MODEL', 'rerank-v4.0-pro'),
                    ],
                ],
            ],
        ],
    ],
];
```

| Config key | Env var | Purpose |
|---|---|---|
| `className` | — | Provider class. Keep the default unless subclassing. |
| `key` (`apiKey` also accepted) | `COHERE_API_KEY` | Key from dashboard.cohere.com. Required. |
| `url` | `COHERE_URL` | API base URL. Change only for proxies or gateways. |
| `models.text.default` | `COHERE_TEXT_MODEL` | Chat model for normal calls. |
| `models.text.cheapest` | `COHERE_TEXT_MODEL_CHEAPEST` | Budget model. |
| `models.text.smartest` | `COHERE_TEXT_MODEL_SMARTEST` | Flagship model. |
| `models.embeddings.default` | `COHERE_EMBEDDINGS_MODEL` | Embeddings model. |
| `models.embeddings.dimensions` | `COHERE_EMBEDDINGS_DIMENSIONS` | Vector width. Must match the embeddings model. |
| `models.reranking.default` | `COHERE_RERANKING_MODEL` | Reranker used when no per-call model is given. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.*` value above, then the provider's built-in fallback.

## See also

- [Providers](./index.md) — capability matrix
- [Reranking](./rerank.md) — ordering search results
- [Embeddings](./embeddings.md) — vectors and caching
