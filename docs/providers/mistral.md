---
description: 'Mistral: text, audio, transcription, and embeddings.'
---

# Mistral

Direct access to Mistral's La Plateforme endpoints. Use it when your stack
standardizes on Mistral for chat text with streaming, speech synthesis,
transcription, and embeddings.

## Capabilities

Text with streaming, audio generation, transcription, and embeddings.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'mistral' => [
                'className' => 'Crustum\Ai\Providers\MistralProvider',
                'key' => env('MISTRAL_API_KEY'),
                'url' => env('MISTRAL_URL', 'https://api.mistral.ai/v1'),
                'models' => [
                    'text' => [
                        'default' => env('MISTRAL_TEXT_MODEL', 'mistral-large-2512'),
                        'cheapest' => env('MISTRAL_TEXT_MODEL_CHEAPEST', 'mistral-small-4'),
                        'smartest' => env('MISTRAL_TEXT_MODEL_SMARTEST', 'mistral-medium-3-5'),
                    ],
                    'embeddings' => [
                        'default' => env('MISTRAL_EMBEDDINGS_MODEL', 'mistral-embed-2312'),
                        'dimensions' => (int)env('MISTRAL_EMBEDDINGS_DIMENSIONS', 1024),
                    ],
                    'transcription' => [
                        'default' => env('MISTRAL_TRANSCRIPTION_MODEL', 'voxtral-mini-2602'),
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
| `key` (`apiKey` also accepted) | `MISTRAL_API_KEY` | Key from console.mistral.ai. Required. |
| `url` | `MISTRAL_URL` | API base URL. Change only for proxies or gateways. |
| `models.text.default` | `MISTRAL_TEXT_MODEL` | Chat model for normal calls. |
| `models.text.cheapest` | `MISTRAL_TEXT_MODEL_CHEAPEST` | Budget model. |
| `models.text.smartest` | `MISTRAL_TEXT_MODEL_SMARTEST` | Flagship model. |
| `models.audio.default` | `MISTRAL_AUDIO_MODEL` | Text-to-speech model (no env mapping in the default file; add one if you use audio). |
| `models.transcription.default` | `MISTRAL_TRANSCRIPTION_MODEL` | Speech-to-text (Voxtral) model. |
| `models.embeddings.default` | `MISTRAL_EMBEDDINGS_MODEL` | Embeddings model. |
| `models.embeddings.dimensions` | `MISTRAL_EMBEDDINGS_DIMENSIONS` | Vector width of the embeddings model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.*` value above, then the provider's built-in fallback.

## See also

- [Providers](./index.md) — capability matrix
- [Audio](./audio.md) — speech and transcription
- [Embeddings](./embeddings.md) — vectors and caching
