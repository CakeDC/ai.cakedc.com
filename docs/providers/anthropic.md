---
description: 'Anthropic: text and streaming, files, and Claude models.'
---

# Anthropic

Direct access to Anthropic's Claude models over the Anthropic API. Use it
when you want Claude for chat text with streaming and file storage, without
going through a gateway. Prompt-caching attributes (`CacheInstructions`,
`CacheToolDefinitions`, `CacheConversation`) target Anthropic's cache
breakpoints: they mark reusable prompt prefixes so repeated calls are billed
at cache-read rates (see [agent configuration](../agents/index.md#configuring-the-run)).

## Capabilities

Text with streaming plus file storage. Provider tools: code execution, tool
search, web fetch, and web search ([details](../agents/provider-tools.md)).

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'anthropic' => [
                'className' => 'Crustum\Ai\Providers\AnthropicProvider',
                'key' => env('ANTHROPIC_API_KEY'),
                'url' => env('ANTHROPIC_URL', 'https://api.anthropic.com/v1'),
                'version' => env('ANTHROPIC_VERSION', '2023-06-01'),
                'models' => [
                    'text' => [
                        'default' => env('ANTHROPIC_TEXT_MODEL', 'claude-sonnet-5-5'),
                        'cheapest' => env('ANTHROPIC_TEXT_MODEL_CHEAPEST', 'claude-haiku-4-5-20251001'),
                        'smartest' => env('ANTHROPIC_TEXT_MODEL_SMARTEST', 'claude-fable-5-1'),
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
| `key` (`apiKey` also accepted) | `ANTHROPIC_API_KEY` | Key from console.anthropic.com. Required. |
| `url` | `ANTHROPIC_URL` | API base URL. Change only for proxies or gateways. |
| `version` | `ANTHROPIC_VERSION` | API version header sent with every request. Keep the default unless Anthropic instructs otherwise. |
| `models.text.default` | `ANTHROPIC_TEXT_MODEL` | Claude model for normal calls and for per-call `model:` fallback. |
| `models.text.cheapest` | `ANTHROPIC_TEXT_MODEL_CHEAPEST` | Budget Claude model for cost-sensitive calls. |
| `models.text.smartest` | `ANTHROPIC_TEXT_MODEL_SMARTEST` | Flagship Claude model for the hardest tasks. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Not in the default file; add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then
`models.text.default`, then the provider's built-in fallback.

## Notes

Prompt prefixes cache only when asked (see [agent configuration](../agents/index.md#configuring-the-run)); cache reads and writes surface in `usage` as `cacheReadInputTokens` and `cacheWriteInputTokens`.

## See also

- [Providers](./index.md) — capability matrix
