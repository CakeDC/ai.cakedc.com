---
description: 'Jina: embeddings and reranking.'
---

# Jina

Jina's search stack for the retrieval half of RAG: embeddings plus
reranking. Use it when the job is text in, vectors or orderings out, and text
generation lives on another provider.

## Capabilities

Embeddings and reranking.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'jina' => [
                'className' => 'Crustum\Ai\Providers\JinaProvider',
                'key' => env('JINA_API_KEY'),
                'url' => env('JINA_URL', 'https://api.jina.ai/v1'),
                'models' => [
                    'embeddings' => [
                        'default' => env('JINA_EMBEDDINGS_MODEL', 'jina-embeddings-v4'),
                        'dimensions' => (int)env('JINA_EMBEDDINGS_DIMENSIONS', 2048),
                    ],
                    'reranking' => [
                        'default' => env('JINA_RERANKING_MODEL', 'jina-reranker-v3.5'),
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
| `key` (`apiKey` also accepted) | `JINA_API_KEY` | Key from jina.ai. Required. |
| `url` | `JINA_URL` | API base URL. Change only for proxies or gateways. |
| `models.embeddings.default` | `JINA_EMBEDDINGS_MODEL` | Embeddings model. |
| `models.embeddings.dimensions` | `JINA_EMBEDDINGS_DIMENSIONS` | Vector width. Must match the embeddings model. |
| `models.reranking.default` | `JINA_RERANKING_MODEL` | Reranker used when no per-call model is given. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Per-call `model:` overrides the configured model for that call.

## See also

- [Providers](./index.md) — capability matrix
- [Embeddings](./embeddings.md) — vectors and caching
- [Reranking](./rerank.md) — ordering search results
