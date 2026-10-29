---
description: 'Vector stores: contract first, Explorator engines second.'
---

# Stores

A store is where documents wait between embedding and retrieval:
create it, add files with metadata, search it at prompt time. The
contract below is provider-managed storage: files upload once, the
provider indexes and searches them. For vectors in your own columns,
see [Retrieval](./retrieval.md).

## The contract

```php
use Crustum\Ai\Stores;

$store = Stores::create('Knowledge Base');

echo $store->name . PHP_EOL;
echo $store->ready ? "ready\n" : "not ready\n";
```

```text [Output]
Knowledge Base
ready
```

`Stores::create()` takes a name plus optional description, initial
file IDs, and idle expiry; `Stores::get($id)` reopens a store by ID
(`fileCounts`, `ready`); `delete()` on the class or the instance
removes it. Creation and deletion assert in tests
(`assertCreated`, `assertDeleted`). The same fake story as
[Embedding](./embeddings.md).

## Files in stores

```php
use Crustum\Ai\Files\Document;
use Crustum\Ai\Stores;

$store = Stores::get('store_id');

$document = $store->add(Document::fromString('CakePHP is a PHP framework.', 'text/plain'), metadata: [
    'author' => 'Larry Masters',
    'year' => 2026,
]);

echo $document->id . PHP_EOL;

$store->remove($document->id);
```

```text [Output]
fake_file_685b6577729e3e4c1287ad1eb6bdbee6
```

`add()` accepts a stored file ID, a file object (stored inline first),
an upload, or raw content via `Document::fromString()`; metadata rides
along for provider-side filtering. `remove()` drops the document from
the index. Pass `deleteFile: true` to also delete the stored file.
Per-file asserts (`assertAdded`, `assertRemoved`) live on the store
instance.

## Search engines

When search lives outside the provider (your tables, your ranking),
Explorator is the backend. Engine names appear here and in the link
below, nowhere else in these pages:

| Engine | Shape | Semantic / hybrid |
|---|---|---|
| `collection` | In-PHP filtering, prototypes and tests | No |
| `database` | Your tables, full-text indexes | Yes, via PostgreSQL `pgvector` |
| `algolia` | Hosted index | No |
| `meilisearch` | Hosted index | Yes, embedder per index |
| `typesense` | Hosted index | Yes, vector field per collection |
| `turbopuffer` | Hosted index | Yes, incl. native embeddings |

### Making models searchable

Attach the behavior (events-only sync) and shape the indexed document
on the entity. The trait is the public API:

```php
namespace App\Model\Table;

use Cake\ORM\Table;

class PostsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->addBehavior('Crustum/Explorator.Searchable');
    }
}
```

```php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class Post extends Entity
{
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
        ];
    }

    public function shouldBeSearchable(): bool
    {
        return $this->status === 'published';
    }
}
```

`shouldBeSearchable()` gates save/delete sync (direct `makeSearchable`
calls bypass it); `searchIndexShouldBeUpdated()` skips reindexing when
irrelevant fields change; `makeSearchableUsing()` prepares entities
before import. Index naming is overridable per table
(`searchableAs()` for reads, `indexableAs()` when writes diverge) and
the document key via `getExploratorKey()` /
`getExploratorKeyName()`.

### Query shapes

One builder, terminated explicitly: `get()`, `first()`,
`paginate()`, `raw()`, or `keys()`:

```php
function findPosts(mixed $posts, string $q): iterable
{
    return $posts->search($q)
        ->where('status', 'published')
        ->semantic()
        ->query(fn ($query) => $query->contain(['Authors']))
        ->paginate(15);
}
```

`where()` / `whereIn()` / `whereNotIn()` take equality and comparison
operators (`=`, `!=`, `<`, `>`, `>=`, `<=`): declare filterable /
sortable attributes in the engine's index settings first.
`->semantic(minSimilarity: 0.6)` ranks by meaning,
`->hybrid(textWeight: 1, semanticWeight: 2)` fuses full-text with
vectors; `->within('posts_index')` targets a custom index and
`->withTrashed()` / `->onlyTrashed()` cover soft-deleted rows when
soft delete is enabled. The `database` engine needs no import step.
It searches your tables directly; hosted engines sync on save (queue
the sync in production) and seed existing rows via console import.

### Index commands

```bash
bin/cake explorator import Posts --chunk=500
bin/cake explorator queue-import Posts --chunk=500
bin/cake explorator flush Posts
bin/cake explorator sync-index-settings
```

`import` seeds the index (`--fresh` rebuilds, `--chunk` sizes
batches); `queue-import` fans out chunked jobs for large tables;
`flush` clears a table's documents; `sync-index-settings` pushes
filterable attributes and collection schemas after config changes.
Table APIs mirror the commands: `importSearchable()` (optionally over
a scoped query), `makeSearchable()` / `removeFromSearch()` /
`flushSearchable()`, and `withoutSyncingToSearch()` for bulk ORM work
that must not touch the index.

### Testing search

```php
namespace App\Test\TestCase;

use Cake\TestSuite\TestCase;

class PostTest extends TestCase
{
    public function testPostIndexedOnSave(): void
    {
        $this->markTestIncomplete('Wire Crustum\\Explorator\\TestSuite\\ExploratorTrait here.');
    }
}
```

The trait captures every write and search in a `TestEngine` instead of
hitting remote drivers: `assertIndexed()` / `assertIndexedTimes()` /
`assertNotIndexed()`, `assertRemovedFromSearch()`, `assertFlushed()`,
`assertSearchPerformed()` / `assertSearchCount()`, plus
`assertIndexedPayloadContains()` and `getExploratorOperationsForTable()`
for payload inspection. Queue-job asserts stay with the queue suite;
for local end-to-end search use the `null`, `collection`, or
`database` driver.

Semantic search embeds the query with `crustum/cakephp-ai`
(`toSearchableEmbedding()` on the entity; a precomputed embedding
array also works). Except Typesense and Turbopuffer native
embeddings, which need no Ai package. Full engine setup, index
settings, console commands, and test asserts stay in the Explorator
docs.

*Engine list dated 2026-10-24.*

## See also

- [Retrieval](./retrieval.md) — searching what stores hold
- [Loading](./loader.md) — files in
- [RAG](./index.md) — the retrieval loop
