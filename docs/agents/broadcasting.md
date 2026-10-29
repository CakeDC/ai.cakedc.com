---
description: 'Broadcasting: fan stream events out to channels as they arrive.'
---

# Broadcasting

`broadcast()` runs the stream and fans every event out to channels while you
iterate them locally. Delivery never breaks the run: fan-out taps the stream,
so a transport failure is logged while iteration continues. `broadcastNow()`
sends each event inline instead of queueing the delivery:

## Broadcasting the stream

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Broadcasting\Channel\Channel;

foreach ((new AnonymousAgent('You are a probe.', [], []))->broadcast('Say hello.', new Channel('chat'), now: true) as $event) {
    echo (new ReflectionClass($event))->getShortName() . "\n";
}
```

```text [Output]
StreamStart
TextStart
TextDelta
TextDelta
TextDelta
TextEnd
StreamEnd
```

Queued delivery needs a worker consuming the queue. That covers `broadcast()`
without `now` and `broadcastOnQueue()` for fully background runs. The streamed
events reach the client the same way.

Transports come from [`crustum/broadcasting`](https://github.com/Crustum/Broadcasting):
Pusher (and Pusher-compatible servers), Mercure hubs, and Redis pub/sub for
production; `log` and `null` drivers for development. Pick one transport per
connection. The channel, event, and payload shape stay the same.

## Skipping oversized events

Some transports cap message sizes. Exclude data-heavy event classes per agent with
`#[WithoutBroadcasting(...)]`, typically data-heavy tool calls and results.
Excluded events still flow through the local stream and are still persisted; they just never leave
the process:

::: code-group

```php [SearchAgent.php]
use Crustum\Ai\Attributes\WithoutBroadcasting;
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasTools;
use Crustum\Ai\Streaming\Event\ToolCall;
use Crustum\Ai\Streaming\Event\ToolResult;
use Crustum\Ai\Trait\PromptableTrait;

#[WithoutBroadcasting(ToolCall::class, ToolResult::class)]
class SearchAgent implements Agent, HasTools
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a probe. You have a shout tool.';
    }

    public function tools(): iterable
    {
        return [new Shout()];
    }
}
```

```php [run.php]
use Crustum\Ai\Attributes\WithoutBroadcasting;

$excluded = WithoutBroadcasting::eventsFor(new SearchAgent());
echo count($excluded) . " excluded\n";
```

:::

```text [Output]
2 excluded
```

## Where next

- [Streaming](./streaming.md) — iterating events
- [Queueing](./queueing.md) — background runs
- [Middleware](./middleware.md) — hooking the run
