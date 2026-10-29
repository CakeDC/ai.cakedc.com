---
description: 'Structured output: typed JSON responses from agents via JSON Schema.'
---

# Structured output

For machine-readable answers, give the agent a JSON Schema. The provider
requests JSON from the model and the plugin decodes it into a
`StructuredAgentResponse` that behaves like an array.

Ad-hoc shape: `StructuredAnonymousAgent` takes a schema closure as its fourth
constructor argument. A dedicated class implements
`Crustum\Ai\Contracts\HasStructuredOutput::schema()` instead. Same contract.

```php
use Crustum\Ai\StructuredAnonymousAgent;

$response = (new StructuredAnonymousAgent(
    'You are a sales coach. Reply with JSON only.',
    [],
    [],
    fn ($schema) => [
        'score' => $schema->integer()->required(),
        'verdict' => $schema->string()->required(),
    ],
))->prompt('Score this rep: never asked for the close.');

echo $response['score'] . ' ' . $response['verdict'] . PHP_EOL;
```

```text [Output]
7 needs-work
```

Nested objects use `$schema->object(fn ($schema) => [...])`, lists use
`$schema->array()->items(...)`, alternatives use `$schema->anyOf([...])`.
Chain each field with `->required()` as needed.

## Nested objects

```php
use Crustum\Ai\StructuredAnonymousAgent;

$response = (new StructuredAnonymousAgent(
    'You are a sales coach. Reply with JSON only.',
    [],
    [],
    fn ($schema) => [
        'score' => $schema->integer()->required(),
        'rep' => $schema->object(fn ($schema) => [
            'name' => $schema->string()->required(),
            'plan' => $schema->string()->enum(['basic', 'pro'])->required(),
        ])->required(),
    ],
))->prompt('Score the rep named Ana on the pro plan: 9.');

echo $response['score'] . ' ' . $response['rep']['name'] . ' ' . $response['rep']['plan'] . PHP_EOL;
```

```text [Output]
9 Ana pro
```

## Lists of objects

```php
use Crustum\Ai\StructuredAnonymousAgent;

$response = (new StructuredAnonymousAgent(
    'You are a sales coach. Reply with JSON only.',
    [],
    [],
    fn ($schema) => [
        'feedback' => $schema->array()->items(
            $schema->object(fn ($schema) => [
                'comment' => $schema->string()->required(),
                'score' => $schema->integer()->required(),
            ])
        )->required(),
    ],
))->prompt('Give one feedback item: no close asked, score 4.');

echo $response['feedback'][0]['comment'] . ' ' . $response['feedback'][0]['score'] . PHP_EOL;
```

```text [Output]
No close asked 4
```

The schema steers the model; decoding tolerates markdown fences around the
JSON. There is no automatic retry on malformed output. Validate the decoded
array in your code before trusting it downstream. Fields that may be absent
use `->nullable()` instead of `->required()`.

## Either/or shapes

`anyOf()` accepts a list of object shapes for polymorphic content. The model
picks the variant, the response carries whichever arrived:

```php
use Crustum\Ai\StructuredAnonymousAgent;

$response = (new StructuredAnonymousAgent(
    'You are a sales coach. Reply with JSON only.',
    [],
    [],
    fn ($schema) => [
        'content' => $schema->anyOf([
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['article'])->required(),
                'title' => $schema->string()->required(),
            ]),
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['image'])->required(),
                'url' => $schema->string()->required(),
            ]),
        ])->required(),
    ],
))->prompt('Give the article titled Close.');

echo $response['content']['type'] . ' ' . $response['content']['title'] . PHP_EOL;
```

```text [Output]
article Close
```

## Where next

- [Agents](./index.md) — lifecycle and prompting
- [Streaming](./streaming.md) — token-by-token delivery
- [Error handling](./error-handling.md) — retries and failures
