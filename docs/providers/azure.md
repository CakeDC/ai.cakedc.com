---
description: 'Azure OpenAI: OpenAI capabilities behind your own deployments.'
---

# Azure OpenAI

OpenAI-compatible capabilities hosted inside your Azure subscription. Use it
when data must stay in your Azure tenant or when you already manage Azure
OpenAI deployments. Unlike the public OpenAI provider, every model reference
is a deployment name you created in the Azure portal — the public model id
never appears in calls.

## Capabilities

Text with streaming, image generation, and embeddings, plus file storage and
file-backed stores. Provider tools: code execution, file search, tool search,
and web search ([details](../agents/provider-tools.md)).

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'azure' => [
                'className' => 'Crustum\Ai\Providers\AzureOpenAiProvider',
                'key' => env('AZURE_OPENAI_API_KEY'),
                'url' => env('AZURE_OPENAI_URL'),
                'api_version' => env('AZURE_OPENAI_API_VERSION', '2025-04-01-preview'),
                'deployment' => env('AZURE_OPENAI_DEPLOYMENT', 'gpt-6-sol'),
                'image_deployment' => env('AZURE_OPENAI_IMAGE_DEPLOYMENT', 'gpt-image-2.5-flare'),
                'embedding_deployment' => env('AZURE_OPENAI_EMBEDDING_DEPLOYMENT', 'text-embedding-3-small'),
                'models' => [
                    'embeddings' => [
                        'dimensions' => (int)env('AZURE_OPENAI_EMBEDDINGS_DIMENSIONS', 1536),
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
| `key` (`apiKey` also accepted) | `AZURE_OPENAI_API_KEY` | Azure resource key. Required. |
| `url` | `AZURE_OPENAI_URL` | Your Azure OpenAI resource endpoint (e.g. `https://<resource>.openai.azure.com/openai/deployments/...`). Required — there is no public default. |
| `api_version` | `AZURE_OPENAI_API_VERSION` | Azure REST API version pinned to your resource. Keep the default unless Azure requires a newer one. |
| `deployment` | `AZURE_OPENAI_DEPLOYMENT` | Text/chat deployment name. Also serves the `cheapest` and `smartest` tiers for this provider. |
| `image_deployment` | `AZURE_OPENAI_IMAGE_DEPLOYMENT` | Image deployment name. |
| `embedding_deployment` | `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Embeddings deployment name. |
| `models.embeddings.dimensions` | `AZURE_OPENAI_EMBEDDINGS_DIMENSIONS` | Vector width of the embeddings deployment. Must match the deployed model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Text tier note: unlike other providers, Azure reads all three text tiers
from the single `deployment` key — set per-call `model:` to a deployment
name to target a different deployment.

## Notes

Every model reference is a deployment name you created in the Azure portal; the public model id never appears in calls.

## See also

- [Providers](./index.md) — capability matrix
- [OpenAI](./openai.md) — the public-endpoint counterpart
