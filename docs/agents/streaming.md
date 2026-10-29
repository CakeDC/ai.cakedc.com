---
description: 'Streaming: token-by-token delivery of agent responses.'
---

# Streaming

Call `stream()` instead of `prompt()` to iterate the run's events as they
arrive. Collect `TextDelta` events for the answer text; the loop still runs
the full pipeline (tools execute, approvals surface) before the stream ends.
In a controller, return `->toResponse()` to send SSE straight to the client.

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Streaming\Event\TextDelta;

$stream = (new AnonymousAgent('You are a probe.', [], []))->stream('Say hello.');

$text = '';
foreach ($stream as $event) {
    if ($event instanceof TextDelta) {
        $text .= $event->delta;
    }
}
echo $text . PHP_EOL;
```

```text [Output]
Say hello back.
```

`then()` registers a callback invoked with the final `StreamedAgentResponse`
once streaming completes (`$response->text`, `->usage`, `->events`).

## Stopping mid-stream

Pass `stopCheck`: a predicate polled between chunks. When it returns true,
the stream aborts with `StoppedException`. Console drivers use this for
Ctrl+C: the predicate reads a stop signal, and the catch maps the exception
to a stopped turn instead of an error:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Exception\StoppedException;

$stream = (new AnonymousAgent('You are a probe.', [], []))
    ->stream('Say hello.', stopCheck: fn () => true);

try {
    foreach ($stream as $event) {
        // never reached: the predicate fires before the first chunk
    }
    echo "finished\n";
} catch (StoppedException) {
    echo "stopped\n";
}
```

```text [Output]
stopped
```

## Chat endpoints

A chat endpoint parses the frontend's request into a `Chat` input, resumes
the thread, and returns the protocol-encoded stream as the response. The
`Chat` carries the thread id and the client's protocol (AG-UI or Vercel),
so one action serves both:

```php
use Crustum\Ai\AgentUserInteraction\AgentUserInteraction;

class ChatController extends AppController
{
    public function run(): Response
    {
        $this->request->allowMethod(['post']);

        $chat = AgentUserInteraction::chat($this->request);

        $user = $this->request->getAttribute('identity');

        return (new SupportAgent())
            ->continue($chat->threadId(), as: $user)
            ->stream($chat)
            ->usingProtocol($chat->protocol())
            ->toResponse();
    }
}
```

`usingVercelDataProtocol()` / `usingAgentUserInteractionProtocol()` do the
same without parsing a request, for streams you drive yourself. Either way
the frontend gets native tool-approval parts (Vercel) or interrupts (AG-UI).

## Where next

- [Agents](./index.md) — lifecycle and prompting
- [Structured output](./structured-output.md) — typed responses
- [Approvals](./approvals.md) — human gates on tool calls
