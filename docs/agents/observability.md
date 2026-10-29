---
description: 'Observability: listening to agent runs through dispatched events.'
---

# Observability

Every run dispatches CakePHP events: before the run, after each step,
around every tool call, on approval pauses, and on failure. Listen without
changing agent code: subscribe with the global `EventManager`, keyed by the
event class's `eventName()` (`Crustum\Ai\Event\AgentPrompted` dispatches as
`Ai.agentPrompted`).

## Listening to runs

`PromptingAgent` fires before the run; `AgentPrompted` fires after, carrying
the invocation id, the prompt, and the response:

```php
use Cake\Event\EventInterface;
use Cake\Event\EventManager;
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Event\AgentPrompted;

EventManager::instance()->on(
    AgentPrompted::eventName(),
    function (EventInterface $event) use (&$seen) {
        $seen[] = $event->getData('response')->text;
    },
);

$response = (new AnonymousAgent('You are a probe.', [], []))->prompt('Say hello.');
echo $response->text . PHP_EOL;
echo implode(',', $seen) . PHP_EOL;
```

```text [Output]
Say hello back.
Say hello back.
```

The payload varies per event (`invocationId`, `prompt`, `response`,
`model`, `provider`, `file`, `store`), so inspect the constructor of the
event class in `Crustum\Ai\Event` for the exact keys. Alternatively, register
listeners in `src/Event/` and attach them during application bootstrap.

## Following steps and tools

Step and tool events narrate multi-step runs. `StartingStep` fires per model
call, `StepCompleted` after, `StepFailed` on failure; `InvokingTool` /
`ToolInvoked` / `ToolFailed` bracket each tool execution:

::: code-group

```php [Shout.php]
use Crustum\Ai\Contracts\Tool;
use Crustum\Ai\Tools\Request;
use Crustum\JsonSchema\Contracts\JsonSchema;

class Shout implements Tool
{
    public function description(): string
    {
        return 'Echo the given text in upper case.';
    }

    public function handle(Request $request): string
    {
        return strtoupper($request->string('text'));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'text' => $schema->string()->required(),
        ];
    }
}
```

```php [run.php]
use Cake\Event\EventInterface;
use Cake\Event\EventManager;
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Event\InvokingTool;
use Crustum\Ai\Event\StepCompleted;

$steps = 0;
$tools = 0;
EventManager::instance()->on(
    InvokingTool::eventName(),
    function (EventInterface $event) use (&$tools) {
        $tools++;
    },
);

EventManager::instance()->on(
    StepCompleted::eventName(),
    function (EventInterface $event) use (&$steps) {
        $steps++;
    },
);

$response = (new AnonymousAgent('You are a probe.', [], [new Shout()]))->prompt('Shout hello.');
echo $response->text . PHP_EOL;
echo "{$tools} tool in {$steps} steps\n";
```

:::

```text [Output]
HELLO
1 tool in 2 steps
```

The model called the tool on the first step and answered on the second, so
two steps completed around one tool invocation.

## The full catalog

Beyond the run lifecycle, events cover failover (`AgentFailedOver`,
`ProviderFailedOver`, `AgentFailed`), streaming (`StreamingAgent`,
`AgentStreamed`), approvals (`ToolApprovalRequested`,
`ToolApprovalResolved`), and media, files, and vector stores (`Generating*`,
`*Generated`, `*Failed`, `StoringFile`, `FileStored`, `StoreCreated`, and
more). Failures pair up: each `Generating*` or `*ing` start event has a
matching `*Failed` event carrying the exception.

Recorder wiring and timelines live under [Observability](../observability/index.md).

## Where next

- [Testing](./testing.md) — asserting events with `AiFlow`
- [Middleware](./middleware.md) — hooking runs instead of observing them
- [Error handling](./error-handling.md) — failures worth listening for
