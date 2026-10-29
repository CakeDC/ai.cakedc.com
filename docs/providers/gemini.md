---
description: 'Gemini: text, images, audio, embeddings, files, and transcription.'
---

# Gemini

Direct access to Google's Gemini models. Use it when you need broad
single-vendor coverage — chat text with streaming, image generation, speech
synthesis, transcription, file storage, and embeddings, including multimodal
embeddings over images, audio, documents, and video.

## Capabilities

Text with streaming, image and audio generation, transcription, text and
multimodal embeddings, plus file storage and file-backed stores. Provider
tools: code execution, file search, web fetch, and web search
([details](../agents/provider-tools.md)).

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'gemini' => [
                'className' => 'Crustum\Ai\Providers\GeminiProvider',
                'key' => env('GEMINI_API_KEY'),
                'url' => env('GEMINI_URL', 'https://generativelanguage.googleapis.com/v1beta'),
                'models' => [
                    'text' => [
                        'default' => env('GEMINI_TEXT_MODEL', 'gemini-3.8-flash'),
                        'cheapest' => env('GEMINI_TEXT_MODEL_CHEAPEST', 'gemini-3.1-flash-lite'),
                        'smartest' => env('GEMINI_TEXT_MODEL_SMARTEST', 'gemini-3.8-flash'),
                    ],
                    'image' => [
                        'default' => env('GEMINI_IMAGE_MODEL', 'gemini-3.1-flash-image'),
                    ],
                    'audio' => [
                        'default' => env('GEMINI_AUDIO_MODEL', 'gemini-3.8-flash-lite-tts'),
                    ],
                    'transcription' => [
                        'default' => env('GEMINI_TRANSCRIPTION_MODEL', 'gemini-3.5-transcribe'),
                    ],
                    'embeddings' => [
                        'default' => env('GEMINI_EMBEDDINGS_MODEL', 'gemini-embedding-2'),
                        'dimensions' => (int)env('GEMINI_EMBEDDINGS_DIMENSIONS', 3072),
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
| `key` (`apiKey` also accepted) | `GEMINI_API_KEY` | Key from Google AI Studio / Cloud console. Required. |
| `url` | `GEMINI_URL` | API base URL. Change only for proxies or gateways. |
| `models.text.default` | `GEMINI_TEXT_MODEL` | Chat model for normal calls. |
| `models.text.cheapest` | `GEMINI_TEXT_MODEL_CHEAPEST` | Budget model for cost-sensitive calls. |
| `models.text.smartest` | `GEMINI_TEXT_MODEL_SMARTEST` | Flagship model for the hardest tasks. |
| `models.image.default` | `GEMINI_IMAGE_MODEL` | Image generation model. |
| `models.audio.default` | `GEMINI_AUDIO_MODEL` | Text-to-speech model. |
| `models.transcription.default` | `GEMINI_TRANSCRIPTION_MODEL` | Speech-to-text model. |
| `models.embeddings.default` | `GEMINI_EMBEDDINGS_MODEL` | Embeddings model. |
| `models.embeddings.dimensions` | `GEMINI_EMBEDDINGS_DIMENSIONS` | Vector width. Must match the embeddings model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.*` value above, then the provider's built-in fallback.

## See also

- [Providers](./index.md) — capability matrix
- [Images](./image.md) — generation and storage
- [Audio](./audio.md) — speech and transcription
- [Embeddings](./embeddings.md) — vectors and caching
