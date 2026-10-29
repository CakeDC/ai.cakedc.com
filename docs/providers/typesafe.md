---
description: 'TypeSafe: the classification-only provider.'
---

# TypeSafe

A classification-only provider: no text, no streams, no media. Use it to get
typed answers with probabilities — you define the answer shape (an enum or
compatible type) and the model picks the most likely value plus a confidence
score. It is the default backend behind `default_for_classification`.

## Capabilities

Classification.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'default_for_classification' => env('AI_DEFAULT_FOR_CLASSIFICATION', 'typesafe'),
        'providers' => [
            'typesafe' => [
                'className' => 'Crustum\Ai\Providers\TypeSafeProvider',
                'key' => env('TYPESAFE_API_KEY'),
                'url' => env('TYPESAFE_URL', 'https://api.typesafe.ai/v1'),
                'models' => [
                    'classification' => [
                        'default' => env('TYPESAFE_CLASSIFICATION_MODEL', 'jev-latest'),
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
| `key` (`apiKey` also accepted) | `TYPESAFE_API_KEY` | TypeSafe key. Required. |
| `url` | `TYPESAFE_URL` | API base URL. Change only for proxies or gateways. |
| `models.classification.default` | `TYPESAFE_CLASSIFICATION_MODEL` | Classification model answering typed questions with probabilities. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Per-call `model:` overrides the configured model for that call.

## See also

- [Providers](./index.md) — capability matrix
- [Classification](./classify.md) — typed answers with probabilities
