---
description: 'Agents in CakePHP AI: dedicated classes or ad-hoc, prompted through any provider.'
---

# Agents

Agents are the fundamental building block for interacting with AI providers.
Each agent is a dedicated PHP class that encapsulates the instructions,
conversation context, tools, and output schema needed to interact with a
large language model. Think of an agent as a specialized assistant, such as
a sales coach, a document analyzer or a support bot, that you configure once and
prompt as needed throughout your application.

Two shapes:

- **Dedicated class** — implements `Crustum\Ai\Contracts\Agent` (plus
  `Conversational`, `HasTools`, `HasStructuredOutput` as needed) with the
  `PromptableTrait`. Portability win: all moving parts live in one entity.
- **Ad-hoc** — `Crustum\Ai\AnonymousAgent` with inline instructions, messages
  and tools. Same loop, no new file.

Scaffold a dedicated agent with Bake (see the `bake agent` command
registered by the Ai plugin), or write the class by hand. Both end at the
same `prompt()` call shown below.

## Minimal agent

Every fence in this guide is executed in CI against the real agent loop
(`bin/cake docs_verify` in AiDocsHarness; the runnable twin of each fence
is registered in the harness app and linked below). Application code never
carries test setup: what you see is what you ship:

```php
use Crustum\Ai\AnonymousAgent;

$response = (new AnonymousAgent(
    'You are a sales coach, analyzing transcripts and providing feedback.',
    [],
    [],
))->prompt('Who are you?');

echo $response->text . PHP_EOL;
```

```text [Output]
I am a sales coach. Give me a transcript.
```

## Lifecycle

`prompt()` runs the full loop and returns an `AgentResponse`:

1. Pipeline middleware (`Pipeline`, agent middlewares) prepares the prompt.
2. The provider's text gateway produces a step (`StepResponse`).
3. Tool calls execute for real; results feed back into the next step.
4. The loop ends on `FinishReason::Stop` (or surfaces `PendingApproval`s
   for the [approval flow](./approvals.md)).
5. Events fire throughout (`PromptingAgent`, `AgentPrompted`,
   `ToolApprovalRequested`, …). See [observability](../observability/index.md).

Every step, tool invocation and event is capturable in tests with
`AiFlow`. See [testing](./testing.md).

## Configuring the run

A dedicated class carries its run configuration as attributes: provider and
model selection, step and token budgets, sampling, timeouts:

::: code-group

```php [SalesCoach.php]
use Crustum\Ai\Attributes\MaxSteps;
use Crustum\Ai\Attributes\Temperature;
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Trait\PromptableTrait;

#[MaxSteps(5)]
#[Temperature(0.7)]
class SalesCoach implements Agent
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a sales coach. Keep feedback to one sentence.';
    }
}
```

```php [run.php]
$response = (new SalesCoach())->prompt('Who are you?');
echo $response->text . PHP_EOL;
```

:::

```text [Output]
I am a sales coach. Give me a transcript.
```

The full set lives in `Crustum\Ai\Attributes`. Every one targets the
agent class:

| Attribute | What it pins |
|---|---|
| `Provider` | lab(s) for this agent — one `Lab`, a name, or a failover list |
| `Model` | model id |
| `UseCheapestModel` / `UseSmartestModel` | cheapest / smartest model per provider |
| `MaxSteps` | tool-loop step budget |
| `MaxTokens` | output token cap |
| `Temperature` / `TopP` | sampling |
| `Timeout` | request timeout in seconds (default 60) |
| `CacheInstructions` / `CacheToolDefinitions` / `CacheConversation` | cache breakpoints, optional TTL |
| `Strict` | strict schema flag sent to providers that support it |
| `RepairToolCalls` | repair unknown local tool calls (plus one step) instead of failing |
| `WithoutBroadcasting` | event classes excluded from fan-out (see [Broadcasting](./broadcasting.md)) |

A failover list on the class tries each vendor in turn on transient
errors. The same list also works per call:

```php
use Crustum\Ai\Attributes\Provider;
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Enums\Lab;
use Crustum\Ai\Trait\PromptableTrait;

#[Provider([Lab::OpenAI, Lab::Anthropic])]
class FailoverCoach implements Agent
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a probe.';
    }
}
```

Per-call overrides travel on the call itself: `prompt($text, provider:
$lab, model: $name)`.

Provider-specific options travel through `HasProviderOptions`, useful for
reasoning effort, penalties, or anything outside the generic set. The method
receives the provider in use, so failover pairs each get their own shape:

```php
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasProviderOptions;
use Crustum\Ai\Enums\Lab;
use Crustum\Ai\Trait\PromptableTrait;

class OptionsCoach implements Agent, HasProviderOptions
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a probe.';
    }

    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::OpenAI => ['reasoning' => ['effort' => 'low']],
            default => [],
        };
    }
}
```

Per-request headers (gateway metadata, routing tags) ride alongside:
providers merge their configured `headers` into every request, and the
builder calls (`withHeaders()`, also accepting a closure over the provider)
add call-scoped ones. Headers never enter the body and never affect cache
keys.

Most providers cache repeated prompt prefixes automatically and report the
split in `usage` (`cacheReadInputTokens`, `cacheWriteInputTokens`, both
subsets of the input total, billed separately). Anthropic and Bedrock only
cache when asked: `#[CacheInstructions]` and `#[CacheToolDefinitions]`
place a breakpoint at the end of instructions and tool definitions, so
every turn reads that prefix from the cache. `#[CacheConversation]` puts the
breakpoint on the latest message instead, so the model re-reads cached
history each step rather than re-paying input tokens for it.
`#[CacheInstructions('1h')]` retains the prefix for an hour instead of five minutes; both attributes in
an hour-long pair must agree on the TTL. Skip `CacheInstructions` when the
instructions change on every request. A shifting prefix pays for a cache
entry it never reuses. Providers without support ignore the attributes, so
failover stays safe.

## Inspecting the response

The response keeps the whole run, not just the final text: every step with
its finish reason, tool calls and results, accumulated usage, and any model
reasoning:

```php
use Crustum\Ai\AnonymousAgent;

$response = (new AnonymousAgent('You are a probe.', [], []))->prompt('Who are you?');

echo $response->text . PHP_EOL;
echo $response->steps->count() . " step\n";
echo $response->steps->first()->finishReason->value . "\n";
```

```text [Output]
I am a probe.
1 step
stop
```

Every text response also exposes the provider's raw HTTP reply via
`$response->raw`: rate-limit headers, request ids, exact payload bodies
(`$response->raw->getHeaderLine('X-RateLimit-Remaining-Requests')`,
`$response->raw->getJson()['id']`). In a tool-call loop each step keeps its
own request's raw reply (`$step->raw`). The property is `null` when there
is no HTTP reply to expose: streamed responses, providers that call out
over an SDK instead of HTTP, and fakes unless one is attached explicitly
with `withRawResponse()`.

## Where next

- [Messages](./messages.md) — learn roles and content blocks
- [Memory](./memory.md) — persist conversation context across prompts
- [Structured output](./structured-output.md) — return typed JSON responses
- [Streaming](./streaming.md) — stream token-by-token delivery
- [Approvals](./approvals.md) — gate tool calls with human approval
- [Sub-agents](./sub-agents.md) — delegate via `AgentTool`
- [Middleware](./middleware.md) — hook the run
- [Error handling](./error-handling.md) — retry transient failures
