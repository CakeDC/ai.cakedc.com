---
description: 'Reranking: ordering documents by relevance to a query.'
---

# Reranking

Reranking reorders documents by relevance to a query, the second pass
after similarity search narrows the field. Cohere, Jina, Bedrock, VoyageAI,
and OpenRouter rerank; each returns scored documents in descending order.

## Reranking documents

Pass plain strings; `limit()` caps the results, `timeout()` bounds the
call, and the provider rides along per request:

```php
use Crustum\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'CakePHP is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->limit(2)->rerank('PHP frameworks');
echo count($response) . " documents\n";
echo $response->first()->document . PHP_EOL;
```

```text [Output]
2 documents
React is a JavaScript library for building user interfaces.
```

`first()` is the top result; every entry carries `document`, `score`, and
its original `index`. Collections rerank through the same call. `Collections::of($posts)->rerank(query: '...', by: 'content', limit: 10)`
resolves each item's text with a field name, fields, or closure.

## See also

- [Providers](./index.md) — capability matrix
- [Cohere](./cohere.md) — the rerank specialist
- [Jina](./jina.md) — search-stack reranking
- [Bedrock](./bedrock.md) — AWS-hosted rerank
