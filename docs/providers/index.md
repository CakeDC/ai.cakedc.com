---
description: 'Providers: capability matrix, defaults, configuration, and switching.'
pageClass: providers-matrix
---

# Providers

Application code talks capabilities (text, images, audio, embeddings,
rerank); providers sit behind the `Ai` config. Every provider class lives
in `Crustum\Ai\Providers` and is selected per call or per capability
default. The ticks below come from the provider contracts each class
implements.

## Capability matrix

Text and Stream ride together: every text provider streams.

| Provider | Text | Stream | Image | Audio | Embed | Rerank | Files | Transcription | Classification | Stores |
|---|---|---|---|---|---|---|---|---|---|---|
| OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Anthropic | ✅ | ✅ | — | — | — | — | ✅ | — | — | — |
| Gemini | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | ✅ |
| OpenRouter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Azure OpenAI | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | — | ✅ |
| Bedrock | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | — | — | — |
| Cohere | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — | — |
| Mistral | ✅ | ✅ | — | ✅ | ✅ | — | — | ✅ | — | — |
| Groq | ✅ | ✅ | — | — | — | — | — | ✅ | — | — |
| xAI | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| DeepSeek | ✅ | ✅ | — | — | — | — | — | — | — | — |
| Ollama | ✅ | ✅ | — | — | ✅ | — | — | — | — | — |
| OpenAI-Compatible | ✅ | ✅ | — | — | ✅ | — | — | ✅ | ✅ | — |
| ElevenLabs | — | — | — | ✅ | — | — | — | ✅ | — | — |
| VoyageAI | — | — | — | — | ✅ | ✅ | — | — | — | — |
| Jina | — | — | — | — | ✅ | ✅ | — | — | — | — |
| TypeSafe | — | — | — | — | — | — | — | — | ✅ | — |

## Provider tools

Web search, page fetch, file search, sandboxed code execution, and tool
search run provider-side, and only some vendors offer each one:

| Tool | Providers |
|---|---|
| Web search | Anthropic, OpenAI, Azure, Gemini, xAI, Groq, OpenRouter |
| Web fetch | Anthropic, Gemini, OpenRouter |
| File search | OpenAI, Azure, Gemini, xAI |
| Code execution | Anthropic, OpenAI, Azure, Gemini, xAI, Groq |
| Tool search | OpenAI, Azure, Anthropic |

Support is a contract check per provider; anything unsupported is
dropped before the request goes out. Full mechanism and payloads:
[Provider tools](../agents/provider-tools.md).

## Capability defaults

Name a provider per call, or set per-capability defaults once in
`config/ai.php`. The file only forwards environment variables with `env()`
— put real values in `.env` or the host environment:

```php
// In config/ai.php
return [
    'Ai' => [
        'defaultProvider' => env('AI_DEFAULT_PROVIDER', 'openrouter'),
        'default_for_images' => env('AI_DEFAULT_FOR_IMAGES', 'openrouter'),
        'default_for_audio' => env('AI_DEFAULT_FOR_AUDIO', 'openrouter'),
        'default_for_transcription' => env('AI_DEFAULT_FOR_TRANSCRIPTION', 'openrouter'),
        'default_for_embeddings' => env('AI_DEFAULT_FOR_EMBEDDINGS', 'openrouter'),
        'default_for_reranking' => env('AI_DEFAULT_FOR_RERANKING', 'openrouter'),
        'default_for_classification' => env('AI_DEFAULT_FOR_CLASSIFICATION', 'typesafe'),
        'default_for_stores' => env('AI_DEFAULT_FOR_STORES', 'openai'),
        'default_for_files' => env('AI_DEFAULT_FOR_FILES', 'openai'),
        'providers' => [
            'openai' => [
                'className' => \Crustum\Ai\Providers\OpenAiProvider::class,
                'apiKey' => env('OPENAI_API_KEY'),
            ],
        ],
    ],
];
```

| Config key | Env var | Purpose |
|---|---|---|
| `defaultProvider` | `AI_DEFAULT_PROVIDER` | Fallback provider for any capability without its own default. |
| `default_for_images` | `AI_DEFAULT_FOR_IMAGES` | Image generation backend. |
| `default_for_audio` | `AI_DEFAULT_FOR_AUDIO` | Text-to-speech backend. |
| `default_for_transcription` | `AI_DEFAULT_FOR_TRANSCRIPTION` | Speech-to-text backend. |
| `default_for_embeddings` | `AI_DEFAULT_FOR_EMBEDDINGS` | Vectors backend. |
| `default_for_reranking` | `AI_DEFAULT_FOR_RERANKING` | Rerank backend. |
| `default_for_classification` | `AI_DEFAULT_FOR_CLASSIFICATION` | Typed-answers backend. |
| `default_for_stores` | `AI_DEFAULT_FOR_STORES` | Vector-store backend. |
| `default_for_files` | `AI_DEFAULT_FOR_FILES` | File-upload backend. |

Every provider reads `key` (or `apiKey`) the same way, plus `url` for the
endpoint and `headers` for extra HTTP headers. Azure also needs `url` plus
`deployment` names; Bedrock authenticates through the AWS SDK (`region`,
default `us-east-1`, plus `access_key_id` / `secret_access_key` or the
default credential chain); Ollama points at `http://localhost:11434` via
`OLLAMA_URL` and its key may stay empty; OpenAI-Compatible needs a `url`
and a configured model for every capability you call. Each provider page
below lists its full option table with the matching env var. Models are
always `models.<capability>.default` (plus `cheapest` / `smartest` for
text, `dimensions` for embeddings) or a per-call `model:` — no model names
are hardcoded in these docs.

## Switching providers

One argument swaps the backend: same agent, same loop, different vendor:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Enums\Lab;

$response = (new AnonymousAgent('You are a probe.', [], []))->prompt(
    'Say hello.',
    provider: Lab::OpenAICompatible,
    model: 'test-model',
);
echo $response->text . PHP_EOL;
echo $response->meta->provider . PHP_EOL;
```

```text [Output]
Switched.
openai-compatible
```

Per-call `model` overrides travel with the switch; without one, the
provider's configured default applies. Pin the choice on the class instead
of the call with `#[Provider(Lab::Anthropic)]`, or a failover list
`#[Provider([Lab::OpenAI, Lab::Anthropic])]`. The full attribute reference
(all fifteen, in `Crustum\Ai\Attributes`) lives under
[Configuring the run](../agents/index.md#configuring-the-run). A provider list fails over to the
next vendor on transient errors. See [Error handling](../agents/error-handling.md).

## Where next

- [OpenAI](./openai.md) — the default for stores and files
- [OpenRouter](./openrouter.md) — the default for most capabilities
- [Ollama](./ollama.md) — local runs without keys
- [Audio](./audio.md) — speech and transcription
- [Images](./image.md) — generation and storage
- [Embeddings](./embeddings.md) — vectors and caching
- [Reranking](./rerank.md) — ordering search results
- [Classification](./classify.md) — typed answers with probabilities
- [Provider tools](../agents/provider-tools.md) — web search, file search, code execution per vendor
