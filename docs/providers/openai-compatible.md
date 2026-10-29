---
description: 'OpenAI-Compatible: any Chat Completions endpoint as a provider.'
---

# OpenAI-Compatible

Any endpoint that speaks the Chat Completions dialect becomes a provider:
self-hosted gateways, proxies, and compatible clouds. Use it to plug a
private or third-party endpoint into the same agent code. There are no
usable built-in model defaults — every capability you actually call must
name its model in config or per call, otherwise the provider throws.

## Capabilities

Text with streaming, embeddings, transcription, and classification.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment. `url` is
required: there is no public default to fall back to.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'openai-compatible' => [
                'className' => 'Crustum\Ai\Providers\OpenAiCompatibleProvider',
                'url' => env('OPENAI_COMPATIBLE_URL'),
                'key' => env('OPENAI_COMPATIBLE_API_KEY'),
                'models' => [
                    'text' => [
                        'default' => env('OPENAI_COMPATIBLE_TEXT_MODEL'),
                    ],
                    'embeddings' => [
                        'default' => env('OPENAI_COMPATIBLE_EMBEDDINGS_MODEL'),
                        'dimensions' => (int)env('OPENAI_COMPATIBLE_EMBEDDINGS_DIMENSIONS', 1536),
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
| `url` | `OPENAI_COMPATIBLE_URL` | Base URL of the compatible endpoint. Required. |
| `key` (`apiKey` also accepted) | `OPENAI_COMPATIBLE_API_KEY` | Token for the endpoint. Set when the endpoint requires auth; leave empty for open local gateways. |
| `models.text.default` | `OPENAI_COMPATIBLE_TEXT_MODEL` | Chat model name as the endpoint knows it. Required when you use text. |
| `models.text.cheapest` / `smartest` | `OPENAI_COMPATIBLE_TEXT_MODEL_CHEAPEST` / `..._SMARTEST` | Optional tier overrides; fall back to `default` when unset. |
| `models.embeddings.default` | `OPENAI_COMPATIBLE_EMBEDDINGS_MODEL` | Embeddings model name. Required when you use embeddings. |
| `models.embeddings.dimensions` | `OPENAI_COMPATIBLE_EMBEDDINGS_DIMENSIONS` | Vector width of the embeddings model. |
| `models.transcription.default` | `OPENAI_COMPATIBLE_TRANSCRIPTION_MODEL` | Speech-to-text model name (no env mapping in the default file; add one if you use transcription). |
| `models.classification.default` | `OPENAI_COMPATIBLE_CLASSIFICATION_MODEL` | Classification model name (same: add env mapping if you use classification). |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Per-call `model:` overrides the configured name. Responses parse as Chat
Completions payloads (`choices[].message`), including tool calls and usage.

## Notes

The `url` is required. There is nowhere sensible to default it. Responses parse as Chat Completions payloads (`choices[].message`), including tool calls and usage.

## See also

- [Providers](./index.md) — capability matrix
- [Classification](./classify.md) — typed answers with probabilities
- [Embeddings](./embeddings.md) — vectors and caching
