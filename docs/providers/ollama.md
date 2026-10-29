---
description: 'Ollama: local text and embeddings, no keys, no cloud.'
---

# Ollama

Chat text with streaming plus embeddings from a local Ollama daemon. Use it
for offline development, eval loops, and air-gapped environments where no
cloud call should happen. It points at `http://localhost:11434` unless told
otherwise, and the key may stay empty.

## Capabilities

Text with streaming and embeddings.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'ollama' => [
                'className' => 'Crustum\Ai\Providers\OllamaProvider',
                'key' => env('OLLAMA_API_KEY', ''),
                'url' => env('OLLAMA_URL', 'http://localhost:11434'),
                'models' => [
                    'text' => [
                        'default' => env('OLLAMA_TEXT_MODEL', 'qwen3.5:4b'),
                        'cheapest' => env('OLLAMA_TEXT_MODEL_CHEAPEST', 'qwen3.5:0.8b'),
                        'smartest' => env('OLLAMA_TEXT_MODEL_SMARTEST', 'gemma4:cloud'),
                    ],
                    'embeddings' => [
                        'default' => env('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text'),
                        'dimensions' => (int)env('OLLAMA_EMBEDDINGS_DIMENSIONS', 768),
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
| `key` (`apiKey` also accepted) | `OLLAMA_API_KEY` | Optional. Leave empty for a plain local daemon; set only when a reverse proxy in front of Ollama demands a token. |
| `url` | `OLLAMA_URL` | Ollama daemon base URL. Local default shown above; point at the LAN/VPN host for remote daemons. |
| `models.text.default` | `OLLAMA_TEXT_MODEL` | Ollama tag for normal chat calls (e.g. `qwen3.5:4b`). |
| `models.text.cheapest` | `OLLAMA_TEXT_MODEL_CHEAPEST` | Smallest/fastest local tag. |
| `models.text.smartest` | `OLLAMA_TEXT_MODEL_SMARTEST` | Most capable local (or proxied) tag. |
| `models.embeddings.default` | `OLLAMA_EMBEDDINGS_MODEL` | Embeddings tag. |
| `models.embeddings.dimensions` | `OLLAMA_EMBEDDINGS_DIMENSIONS` | Vector width of the embeddings tag. Must match the pulled model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request (e.g. proxy auth). Add as a plain array if needed. |

Model names are Ollama tags. Pull them with `ollama pull <tag>` before first
use — unknown tags fail at request time, not at configuration time. Per-call
`model:` overrides the configured tag.

## Notes

The daemon must be reachable from the app host; remote Ollamas go in `url`, and reverse proxies that demand a token go in `key`. Pull a model before first use. Unknown tags fail at request time, not at configuration time.

## See also

- [Providers](./index.md) — capability matrix
- [Embeddings](./embeddings.md) — vectors and caching
