---
description: 'Loading files for RAG: readers, storage, reuse in prompts.'
---

# Loading

Everything retrieved starts as a file. The `Document` and `Image`
classes (plus `Audio` and `Video`) build files from every source you
have, `put()` stores them with the provider once, and `fromId()`
references the stored copy later without re-uploading.

## Putting files in

```php
use Crustum\Ai\Files\Document;

$stored = Document::fromString('CakePHP is a PHP framework.', 'text/plain')->put();

echo $stored->id . PHP_EOL;
```

```text [Output]
fake_file_685b6577729e3e4c1287ad1eb6bdbee6
```

Every reader ends at the same `put()`:

```php
use Crustum\Ai\Enums\Lab;
use Crustum\Ai\Files\Document;

$stored = Document::fromPath('/var/www/knowledge.txt')
    ->withProviderOptions(['purpose' => 'assistants'])
    ->put(provider: 'openai');

echo $stored->id . PHP_EOL;
```

```text [Output]
fake_file_2c8b70838a6eaf4b6dadec6b38eddc75
```

Readers: `fromPath()`, `fromStorage()` (filesystem disk),
`fromUrl()`, `fromString()`, `fromUpload()`. Options set inline ride
along (`purpose`), or branch per provider with a closure receiving the
current `Lab`. Stored files attach to prompts via
`Document::fromId($stored->id)`. See
[Vector Stores](./store.md) for indexing them instead.

## Reading and removing

```php
use Crustum\Ai\Files\Document;

$file = Document::fromId('file-id')->get();

echo $file->mimeType() . PHP_EOL;

Document::fromId('file-id')->delete();
```

```text [Output]
text/plain
```

`get()` returns the stored metadata; `delete()` drops the provider
copy. Removing a file from a [store](./store.md) keeps the stored copy
unless asked. Re-adding it later is one `add()` call, not a re-upload.

## See also

- [Embedding](./embeddings.md) — files to vectors
- [Stores](./store.md) — indexing files for search
- [RAG](./index.md) — the retrieval loop
