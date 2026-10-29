---
description: 'Retrieval strategies: tables, tools, provider search, rerank.'
---

# Retrieval

Storage decides where documents wait ([Stores](./store.md)); retrieval
decides which ones reach the prompt. Three strategies, one comparison
at the end.

## Application tables

Vectors live in your own `vector` columns (PostgreSQL with `pgvector`
or MariaDB 11.7+) and the `Crustum/Ai.VectorSearch` behavior adds the
`similarTo` finder that filters by cosine distance and orders
most-similar first:

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

Pass an `embedding` array, or a raw `search` string: auto-embedded
first. `column`, `minSimilarity` (0.0–1.0 cosine), and `limit` shape
the query; the SQL dialect follows the connection. Your SQL, your
data, no uploads. But the query-time embedding still calls a
provider unless you pass a precomputed vector.

## Retrieval as a tool

Give an agent the finder through `SimilaritySearch::usingModel()`:
table, vector column, threshold, limit, and an optional query closure
for scoping (`published`, `user_id`):

```php
use Crustum\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel(
            model: 'Documents',
            column: 'embedding',
            minSimilarity: 0.7,
            limit: 10,
            query: fn ($query) => $query->where(['published' => true]),
        )->withDescription('Search the knowledge base for relevant articles.'),
    ];
}
```

A custom closure (`new SimilaritySearch(using: ...)`) covers joins and
per-user filters; `rerank()` reorders hits through the
[reranker](#rerank-the-shortlist).

## Provider search

Files already indexed in [stores](./store.md) are searched
provider-side: no vectors in your schema:

```php
use Crustum\Ai\Providers\Tools\FileSearch;

$tool = new FileSearch(stores: ['store_1', 'store_2'], where: ['year' => 2026]);

echo count($tool->ids()) . " stores\n";
```

```text [Output]
2 stores
```

Supported on OpenAI, Azure, Gemini, and xAI. One store or many;
`where` filters on the [metadata](./store.md#files-in-stores) attached
at `add()` time: plain arrays for equality, a `FileSearchQuery`
closure for `whereNot` / `whereIn` shapes.

## Rerank the shortlist

Embedding recall is cheap and approximate; a reranker reads query and
candidate together and scores precisely. Narrow a broad shortlist to
the few results the model actually sees:

```php
use Crustum\Ai\Reranking;

$response = Reranking::of([
    'CakePHP authentication plugins compared.',
    'Deploying CakePHP with Docker and Queue.',
    'Baking models, controllers, and templates.',
])->limit(2)->rerank('CakePHP authentication');

echo count($response) . " documents\n";
echo $response->first()->document . PHP_EOL;
```

```text [Output]
2 documents
Deploying CakePHP with Docker and Queue.
```

`first()` is the top result; every entry carries `document`, `score`,
and its original `index`. Collections rerank through the same call:
`Reranking::of($posts->extract('body')->toList())`, or
`Collections::of($posts)->rerank(query:, by:, limit:)`. In tests, fake
the call (`Reranking::fake()`) and assert on the prompt
(`assertReranked`, `assertNothingReranked`) with the same facade pattern
as [Embedding](./embeddings.md#testing-without-keys).

## Compare

| | Tables | Provider stores | Search engine |
|---|---|---|---|
| Vectors live | Your columns | Provider index | Engine index |
| Uploads leave your infra | No | Yes | Depends on engine |
| Needs `vector` support | Yes (pgvector / MariaDB 11.7+) | No | No |
| Filter | `where` on the query | `where` metadata | Engine `where` clauses |
| Tool | `SimilaritySearch` | `FileSearch` | Engine search builder |

## See also

- [Stores](./store.md) — where documents wait
- [Embedding](./embeddings.md) — vectors out
- [RAG](./index.md) — the retrieval loop
