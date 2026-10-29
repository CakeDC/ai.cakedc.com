---
description: 'Bedrock: AWS-hosted models for text, images, embeddings, rerank.'
---

# Bedrock

AWS Bedrock access to hosted models (including Anthropic Claude and Amazon
Titan/Nova families) through the AWS SDK instead of plain HTTPS calls. Use it
when workloads must run inside AWS with IAM-based auth and AWS logging. There
is no API key in this config: credentials come from the SDK's default chain
(environment variables, shared config file, or instance role).

## Capabilities

Text with streaming, image generation, embeddings, and reranking.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment. Requires the
suggested `aws/aws-sdk-php` dependency.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'bedrock' => [
                'className' => 'Crustum\Ai\Providers\BedrockProvider',
                'access_key_id' => env('AWS_ACCESS_KEY_ID'),
                'secret_access_key' => env('AWS_SECRET_ACCESS_KEY'),
                'region' => env('AWS_REGION', 'us-east-1'),
                'use_default_credential_provider' => true,
                'models' => [
                    'text' => [
                        'default' => env('BEDROCK_TEXT_MODEL', 'global.anthropic.claude-sonnet-5-5'),
                        'cheapest' => env('BEDROCK_TEXT_MODEL_CHEAPEST', 'global.anthropic.claude-haiku-4-5-20251001-v1:0'),
                        'smartest' => env('BEDROCK_TEXT_MODEL_SMARTEST', 'global.anthropic.claude-opus-5-5'),
                    ],
                    'embeddings' => [
                        'default' => env('BEDROCK_EMBEDDINGS_MODEL', 'amazon.titan-embed-text-v2:0'),
                        'dimensions' => (int)env('BEDROCK_EMBEDDINGS_DIMENSIONS', 1024),
                    ],
                    'image' => [
                        'default' => env('BEDROCK_IMAGE_MODEL', 'amazon.nova-canvas-v1:0'),
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
| `access_key_id` | `AWS_ACCESS_KEY_ID` | Static AWS key. Omit to use the SDK default chain (shared config, instance role). |
| `secret_access_key` | `AWS_SECRET_ACCESS_KEY` | Static AWS secret. Omit together with the key id when using IAM roles. |
| `region` | `AWS_REGION` | AWS region hosting the Bedrock models. Model availability is region-scoped. |
| `use_default_credential_provider` | — (config only) | `true` lets the SDK fall back to its default chain when no static keys are set. Set `false` to force static credentials. |
| `assume_role.arn` et al. | — (config only) | Optional STS assume-role block (`arn`, `session_name`, `duration_seconds`, `external_id`). Not in the default file; add when cross-account access is needed. |
| `models.text.default` | `BEDROCK_TEXT_MODEL` | Bedrock model id for normal text calls. |
| `models.text.cheapest` | `BEDROCK_TEXT_MODEL_CHEAPEST` | Budget model id. |
| `models.text.smartest` | `BEDROCK_TEXT_MODEL_SMARTEST` | Flagship model id. |
| `models.embeddings.default` | `BEDROCK_EMBEDDINGS_MODEL` | Embeddings model id. |
| `models.embeddings.dimensions` | `BEDROCK_EMBEDDINGS_DIMENSIONS` | Vector width of the embeddings model. |
| `models.image.default` | `BEDROCK_IMAGE_MODEL` | Image model id. |
| `models.reranking.default` | `BEDROCK_RERANKING_MODEL` | Reranking model id (no env mapping in the default file; add one if you use rerank). |
| `headers` | — (config only) | Extra headers merged into SDK calls. Add as a plain array if needed. |

Model selection priority per call: explicit `model:` argument wins, then the
matching `models.*` value above, then the provider's built-in fallback.

## Notes

Credentials come from the SDK's default chain (environment, shared config, or instance role). Calls go through the AWS SDK instead of plain HTTP, so raw HTTP replies are unavailable on responses.

## See also

- [Providers](./index.md) — capability matrix
- [Reranking](./rerank.md) — ordering search results
- [Embeddings](./embeddings.md) — vectors and caching
