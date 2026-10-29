---
description: 'VoyageAI: embeddings and reranking.'
---

# VoyageAI

A specialist provider for the retrieval half of RAG: embeddings plus
reranking, nothing else. Use it when you already generate text elsewhere but
want Voyage's vectors and reranker. Multimodal inputs work (image and video
alongside text), but remote URL media and Base64 media cannot mix in one
request.

## Capabilities

Embeddings (text, image, video) and reranking.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'voyageai' => [
                'className' => 'Crustum\Ai\Providers\VoyageAiProvider',
                'key' => env('VOYAGE_AI_API_KEY'),
                'url' => env('VOYAGE_AI_URL', 'https://api.voyageai.com/v1'),
                'models' => [
                    'embeddings' => [
                        'default' => env('VOYAGE_AI_EMBEDDINGS_MODEL', 'voyage-4'),
                        'dimensions' => (int)env('VOYAGE_AI_EMBEDDINGS_DIMENSIONS', 1024),
                    ],
                    'reranking' => [
                        'default' => env('VOYAGE_AI_RERANKING_MODEL', 'rerank-3'),
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
| `key` (`apiKey` also accepted) | `VOYAGE_AI_API_KEY` | Key from dash.voyageai.com. Required. Note the `VOYAGE_AI_` prefix with underscore. |
| `url` | `VOYAGE_AI_URL` | API base URL. Change only for proxies or gateways. |
| `models.embeddings.default` | `VOYAGE_AI_EMBEDDINGS_MODEL` | Embeddings model. |
| `models.embeddings.dimensions` | `VOYAGE_AI_EMBEDDINGS_DIMENSIONS` | Vector width of the embeddings model. |
| `models.reranking.default` | `VOYAGE_AI_RERANKING_MODEL` | Reranker used when no per-call model is given. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Per-call `model:` overrides the configured model for that call.

## See also

- [Providers](./index.md) — capability matrix
- [Embeddings](./embeddings.md) — vectors and caching
- [Reranking](./rerank.md) — ordering search results
