---
description: 'DeepSeek: text inference, nothing else.'
---

# DeepSeek

A minimal text-only provider for pure generation jobs. Use it when the task
is chat text with streaming and nothing else is needed — no media, no
embeddings, no auxiliary capabilities. The smallest surface in the matrix.

## Capabilities

Text with streaming.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'deepseek' => [
                'className' => 'Crustum\Ai\Providers\DeepSeekProvider',
                'key' => env('DEEPSEEK_API_KEY'),
                'url' => env('DEEPSEEK_URL', 'https://api.deepseek.com/v1'),
                'models' => [
                    'text' => [
                        'default' => env('DEEPSEEK_TEXT_MODEL', 'deepseek-flash'),
                        'cheapest' => env('DEEPSEEK_TEXT_MODEL_CHEAPEST', 'deepseek-flash'),
                        'smartest' => env('DEEPSEEK_TEXT_MODEL_SMARTEST', 'deepseek-v4-pro'),
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
| `key` (`apiKey` also accepted) | `DEEPSEEK_API_KEY` | Key from the DeepSeek platform. Required. |
| `url` | `DEEPSEEK_URL` | API base URL. Change only for proxies or gateways. |
| `models.text.default` | `DEEPSEEK_TEXT_MODEL` | Chat model for normal calls. |
| `models.text.cheapest` | `DEEPSEEK_TEXT_MODEL_CHEAPEST` | Budget model. |
| `models.text.smartest` | `DEEPSEEK_TEXT_MODEL_SMARTEST` | Flagship model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then
`models.text.default`, then the provider's built-in fallback.

## See also

- [Providers](./index.md) — capability matrix
