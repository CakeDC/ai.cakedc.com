---
description: 'Groq: fast text inference plus transcription.'
---

# Groq

Fast inference endpoints for chat text with streaming plus transcription.
Use it when latency matters and the job fits text generation with
OpenAI-style model ids, optionally with speech-to-text on the side.

## Capabilities

Text with streaming and transcription. Provider tools: code execution and web
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
            'groq' => [
                'className' => 'Crustum\Ai\Providers\GroqProvider',
                'key' => env('GROQ_API_KEY'),
                'url' => env('GROQ_URL', 'https://api.groq.com/openai/v1'),
                'models' => [
                    'text' => [
                        'default' => env('GROQ_TEXT_MODEL', 'openai/gpt-oss-120b'),
                        'cheapest' => env('GROQ_TEXT_MODEL_CHEAPEST', 'openai/gpt-oss-20b'),
                        'smartest' => env('GROQ_TEXT_MODEL_SMARTEST', 'openai/gpt-oss-120b'),
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
| `key` (`apiKey` also accepted) | `GROQ_API_KEY` | Key from console.groq.com. Required. |
| `url` | `GROQ_URL` | API base URL. Change only for proxies or gateways. |
| `models.text.default` | `GROQ_TEXT_MODEL` | Chat model for normal calls. |
| `models.text.cheapest` | `GROQ_TEXT_MODEL_CHEAPEST` | Budget model. |
| `models.text.smartest` | `GROQ_TEXT_MODEL_SMARTEST` | Flagship model. |
| `models.transcription.default` | `GROQ_TRANSCRIPTION_MODEL` | Speech-to-text model (no env mapping in the default file; add one if you use transcription). |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then
`models.text.default`, then the provider's built-in fallback.

## See also

- [Providers](./index.md) — capability matrix
- [Audio](./audio.md) — speech and transcription
