---
description: 'OpenAI: text, images, audio, embeddings, files, and classification.'
---

# OpenAI

The reference provider for general-purpose work. Use it when you need the
widest capability coverage from a single vendor: chat text with streaming,
image generation, speech synthesis, transcription, embeddings,
classification, plus file uploads and file-backed vector stores. It is the
default backend for `default_for_stores` and `default_for_files`.

## Capabilities

Text with streaming, image and audio generation, transcription, embeddings,
and classification with typed answers, plus file storage and file-backed
stores. Provider tools: code execution, file search, tool search, and web
search ([details](../agents/provider-tools.md)).

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'openai' => [
                'className' => 'Crustum\Ai\Providers\OpenAiProvider',
                'apiKey' => env('OPENAI_API_KEY'),
                'url' => env('OPENAI_URL', 'https://api.openai.com/v1'),
                'store' => env('OPENAI_STORE', true),
                'timeout' => (int)env('OPENAI_TIMEOUT', 120),
                'models' => [
                    'text' => [
                        'default' => env('OPENAI_TEXT_MODEL', 'gpt-6.1-sol'),
                        'cheapest' => env('OPENAI_TEXT_MODEL_CHEAPEST', 'gpt-6-luna'),
                        'smartest' => env('OPENAI_TEXT_MODEL_SMARTEST', 'gpt-6-astra'),
                    ],
                    'image' => [
                        'default' => env('OPENAI_IMAGE_MODEL', 'gpt-image-2.5-flare'),
                    ],
                    'audio' => [
                        'default' => env('OPENAI_AUDIO_MODEL', 'gpt-4o-mini-tts'),
                    ],
                    'transcription' => [
                        'default' => env('OPENAI_TRANSCRIPTION_MODEL', 'gpt-4o-transcribe-diarize'),
                    ],
                    'embeddings' => [
                        'default' => env('OPENAI_EMBEDDINGS_MODEL', 'text-embedding-3-small'),
                        'dimensions' => (int)env('OPENAI_EMBEDDINGS_DIMENSIONS', 1536),
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
| `apiKey` (`key` also accepted) | `OPENAI_API_KEY` | Secret key from the OpenAI dashboard. Required for cloud calls. |
| `url` | `OPENAI_URL` | API base URL. Default is the public endpoint; change only for proxies or gateways. |
| `store` | `OPENAI_STORE` | Whether text responses are stored server-side for later reuse (distillation, evals). Set `false` for stateless calls. |
| `timeout` | `OPENAI_TIMEOUT` | HTTP timeout in seconds. Applies to the provider's HTTP client. |
| `models.text.default` | `OPENAI_TEXT_MODEL` | Chat model used when no per-call `model:` is given. |
| `models.text.cheapest` | `OPENAI_TEXT_MODEL_CHEAPEST` | Budget model for `cheapest` tier / cost-sensitive calls. |
| `models.text.smartest` | `OPENAI_TEXT_MODEL_SMARTEST` | Flagship model for `smartest` tier / hardest tasks. |
| `models.image.default` | `OPENAI_IMAGE_MODEL` | Image generation model. |
| `models.audio.default` | `OPENAI_AUDIO_MODEL` | Text-to-speech voice model. |
| `models.transcription.default` | `OPENAI_TRANSCRIPTION_MODEL` | Speech-to-text model. |
| `models.embeddings.default` | `OPENAI_EMBEDDINGS_MODEL` | Embeddings model. |
| `models.embeddings.dimensions` | `OPENAI_EMBEDDINGS_DIMENSIONS` | Vector width. Must match the model; change both together. |
| `headers` | — (config only) | Extra HTTP headers merged into every request (e.g. proxy auth). Not in the default file; add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.<capability>.default` above, then the provider's built-in
fallback. `cheapest` / `smartest` tiers read their own keys.

## Notes

For images, pass `n` to generate several at once; classification also accepts image attachments alongside the classified state.

## See also

- [Providers](./index.md) — compare the capability matrix
- [Images](./image.md) — generate and store images
- [Audio](./audio.md) — synthesize speech and transcribe audio
- [Embeddings](./embeddings.md) — embed vectors with caching
- [Classification](./classify.md) — classify with typed answers
