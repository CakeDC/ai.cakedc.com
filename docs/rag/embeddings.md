---
description: 'Embedding for RAG: widths, providers, fakes, and testing.'
---

# Embedding

Vectors are the retrieval side of RAG: every passage and every query
becomes a float array, and similarity decides what the model sees.
`Embeddings::for()` embeds many inputs in one call; the full
reference (generation, multimodal inputs, caching) lives under
[Providers](./../providers/embeddings.md).

## Widths for your columns

Size the vectors to the column that will hold them. `dimensions()`
pins the width explicitly; without it the provider default applies:

```php
use Crustum\Ai\Embeddings;

$response = Embeddings::for(['Napa Valley has great wine.'])->dimensions(1536)->generate();

echo count($response->first()) . " dimensions\n";
```

```text [Output]
1536 dimensions
```

Pick the width once: the `vector` column length, the provider model,
and every query must agree. Changing any of the three means
re-embedding. Which providers embed, and their defaults, is a
[provider capability](../providers/embeddings.md); local versus hosted
is a cost and privacy call, not a code change.

## Testing without keys

Fake the vector path and assert on the prompts the code built:

```php
use Crustum\Ai\Embeddings;
use Crustum\Ai\Prompts\EmbeddingsPrompt;

Embeddings::fake();

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'CakePHP is a PHP framework.',
])->dimensions(1536)->generate();

echo count($response->embeddings) . " embeddings\n";

Embeddings::assertGenerated(
    fn (EmbeddingsPrompt $prompt) => $prompt->contains('CakePHP') && $prompt->dimensions === 1536,
);
```

```text [Output]
2 embeddings
```

`assertGenerated()` / `assertNotGenerated()` /
`assertNothingGenerated()` cover the prompt; `assertQueued()` covers
queued generations. Fakes return shape-correct vectors, so ranking
code runs offline. For a byte-stable loop see
[RAG](./index.md). Queued variants mirror the same assertions with
`QueuedEmbeddingsPrompt`.

## See also

- [Providers — Embeddings](../providers/embeddings.md) — generation, multimodal, caching, similarity
- [Loading](./loader.md) — files in
- [Stores](./store.md) — where vectors wait
