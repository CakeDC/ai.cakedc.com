---
description: 'xAI: text and image generation from Grok models.'
---

# xAI

Direct access to xAI's Grok family. Use it when your product standardizes on
Grok for chat text with streaming plus image generation.

## Capabilities

Text with streaming and image generation. Provider tools: code execution,
file search, and web search ([details](../agents/provider-tools.md)).

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'xai' => [
                'className' => 'Crustum\Ai\Providers\XaiProvider',
                'key' => env('XAI_API_KEY'),
                'url' => env('XAI_URL', 'https://api.x.ai/v1'),
                'models' => [
                    'text' => [
                        'default' => env('XAI_TEXT_MODEL', 'grok-4.7'),
                        'cheapest' => env('XAI_TEXT_MODEL_CHEAPEST', 'grok-4.20-non-reasoning'),
                        'smartest' => env('XAI_TEXT_MODEL_SMARTEST', 'grok-4.7'),
                    ],
                    'image' => [
                        'default' => env('XAI_IMAGE_MODEL', 'grok-imagine-image-2.0'),
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
| `key` (`apiKey` also accepted) | `XAI_API_KEY` | Key from console.x.ai. Required. |
| `url` | `XAI_URL` | API base URL. Change only for proxies or gateways. |
| `models.text.default` | `XAI_TEXT_MODEL` | Grok chat model for normal calls. |
| `models.text.cheapest` | `XAI_TEXT_MODEL_CHEAPEST` | Budget / non-reasoning model. |
| `models.text.smartest` | `XAI_TEXT_MODEL_SMARTEST` | Flagship Grok model. |
| `models.image.default` | `XAI_IMAGE_MODEL` | Image generation model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.*` value above, then the provider's built-in fallback.

## See also

- [Providers](./index.md) — capability matrix
- [Images](./image.md) — generation and storage
