---
description: 'Queueing: running agent turns in the background, sync or async.'
---

# Queueing

`queue()` dispatches the turn as an `InvokeAgentJob` instead of running it
inline. The HTTP request stays fast while the agent works in the
background. `then()` / `catch()` callbacks travel inside the payload and run
wherever the job runs:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Responses\AgentResponse;

(new AnonymousAgent('You are a probe.', [], []))
    ->queue('Say hello.')
    ->then(function (AgentResponse $response) {
        echo $response->text . PHP_EOL;
    });
```

```text [Output]
Say hello back.
```

The handle dispatches when it is destroyed, so callbacks must be registered
first. Then the job (and its callbacks) travel together to the worker, the
sync runner, or tests.

## Completion callbacks

`then()` callbacks receive the job's result (or its `getResponse()`, when
the job provides one); `catch()` callbacks receive the failure. A job may
also define a duck-typed `failed(Throwable $throwable, array $data)` hook.
Callback failures are logged and swallowed. Callbacks observe, they never
decide the job's outcome. Custom packing goes through
`HasCallbackSerializer::callbackSerializer()`; the default needs
`laravel/serializable-closure`.

Queue mechanics (sync mode, middleware, rate limiting, circuit breaker)
live in [`crustum/cakephp-queue`](https://github.com/Crustum/cakephp-queue).
Ai only declares the `ai` connection and its processor on top of it.

## Broadcasting from the queue

`broadcastOnQueue()` combines both: the turn runs on the queue and its
streamed events are broadcast as they arrive:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Broadcasting\Channel\Channel;

(new AnonymousAgent('You are a probe.', [], []))->broadcastOnQueue('Say hello.', new Channel('chat'));
echo "queued\n";
```

```text [Output]
queued
```

Ai jobs never share the application's `default` queue: configure a dedicated
connection with `Crustum\Ai\Queue\AiJobProcessor` and point
`Ai.queue.connection` at it. With sync mode on (`CrustumQueue.sync`), queue
calls run in-process through the same processor. No broker, no worker.

Durability boundary: the queued payload and the stored conversation rows
survive a crash; mid-turn provider state does not. A retried job re-runs
its turn from the payload, and a turn that died partway is stored as
`Failed` along with the steps it had already completed.

## Queue configuration

The processor is the contract: it gives the job return-as-data semantics
and runs the `then` / `catch` payload callbacks wherever the job runs
(worker, sync runner, or tests). A plain worker processor would ACK
everything and drop the callbacks. Packed callbacks need serializable
closures (`composer require laravel/serializable-closure`):

```php
// In config/queue.php
return [
    'Queue' => [
        'ai' => [
            'url' => 'null://null', // broker DSN in production
            'queue' => 'ai',
            'processor' => \Crustum\Ai\Queue\AiJobProcessor::class,
        ],
    ],
    'Ai' => [
        'queue' => ['connection' => 'ai', 'queue' => 'ai'],
    ],
];
```

## Where next

- [Broadcasting](./broadcasting.md) — fanning out stream events
- [Streaming](./streaming.md) — iterating events
- [Approvals](./approvals.md) — human gates on tool calls
