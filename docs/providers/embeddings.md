---
description: 'Embeddings: vectors for search, plus caching and similarity.'
---

# Embeddings

`Embeddings::for()` turns strings (or images, audio, documents, video)
into float vectors for similarity search. OpenAI, Gemini, Cohere, Mistral,
VoyageAI, Jina, Ollama, Bedrock, Azure, and OpenRouter embed; Gemini adds
multimodal inputs, VoyageAI image and video.

## Generating

One call embeds many inputs; `dimensions()` pins the width, `generate()`
picks an optional provider and model:

```php
use Crustum\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'CakePHP is a PHP framework.',
])->dimensions(8)->generate();
echo count($response->embeddings) . " embeddings\n";
echo count($response->first()) . " dimensions\n";
```

```text [Output]
2 embeddings
8 dimensions
```

Without `dimensions()`, the provider's default width applies (1536 on
OpenRouter, 768 on the stock Ollama config). Multimodal inputs use the
file builders (`Image::fromStorage()`, `Video::fromPath()` …) mixed with
plain strings. The vector-store and retrieval loop built on top lives
under RAG.

## Caching

Repeat inputs should not rebill. Flip caching on globally or per request
(per-input keys by default, one shared key with `individually: false`),
held for 30 days and keyed by provider, model, dimensions, and content:

```php
// In config/ai.php
return [
    'Ai' => [
        'caching' => [
            'embeddings' => [
                'cache' => true,
                'store' => env('CACHE_STORE', 'database'),
                'individually' => true,
            ],
        ],
    ],
];
```

Headers stay out of cache keys; `cache(seconds: 3600)` scopes one request.

## Similarity search

Store vectors in a `vector` column, sized to the embedding width, then
attach the `Crustum/Ai.VectorSearch` behavior to query them back. Supported
on PostgreSQL via the `pgvector` extension and on MariaDB 11.7+ via its
native vector support:

```php
use Migrations\BaseMigration;

class CreateDocuments extends BaseMigration
{
    public function up(): void
    {
        $this->table('documents')
            ->addColumn('title', 'string')
            ->addColumn('content', 'text')
            ->addColumn('embedding', 'vector', ['length' => 1536])
            ->create();
    }
}
```

```php
namespace App\Model\Table;

use Cake\ORM\Table;

class DocumentsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->addBehavior('Crustum/Ai.VectorSearch');
    }
}
```

The behavior's `similarTo` finder filters by cosine distance
(`1 - minSimilarity`, default `0.6`) and orders most-similar first:

```php
use Cake\ORM\TableRegistry;

function findSimilarDocs(array $embedding): iterable
{
    return TableRegistry::getTableLocator()->get('Documents')
        ->find('similarTo',
            column: 'embedding',
            embedding: $embedding,
            minSimilarity: 0.4,
        )
        ->limit(10)
        ->all();
}
```

Pass an `embedding` array, or a raw `search` string. Auto-embedded
first. `column`, `minSimilarity` (0.0–1.0 cosine), and `limit` shape the
query.

The SQL dialect follows the query connection automatically: pgvector's
`<=>` on PostgreSQL, `VEC_DISTANCE_COSINE` on MariaDB. Anything else
throws. Building SQL without a live connection (or forcing one shape) takes
the override: `addBehavior('Crustum/Ai.VectorSearch', ['dialect' =>
'mariadb'])` (`postgres` for the other side).

## See also

- [Providers](./index.md) — capability matrix
- [OpenAI](./openai.md) — the embedding default family
- [Cohere](./cohere.md) — embed plus rerank
