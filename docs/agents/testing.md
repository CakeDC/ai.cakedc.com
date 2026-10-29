---
description: 'Testing: faking agent responses and asserting prompts, tools, steps, and HTTP.'
---

# Testing

Two layers, both offline. Per-agent fakes (`Agent::fake()` plus the
`assertPrompted()` family) cover fast unit tests without touching HTTP.
`Crustum\Ai\TestSuite\AiFlow` (plus `AiFlowTrait`) covers the whole flow in
Pest or PHPUnit: faked provider HTTP, tool and step assertions, stream
assertions, and event assertions.

## Faking responses

Call `fake()` on the agent class. With no arguments every prompt gets an
auto-generated reply; with a list, responses come back in order; with a
closure, each prompt is answered dynamically:

```php
FakeableAgent::fake([
    'First response',
    fn (string $prompt) => 'Echo: ' . $prompt,
]);

echo (new FakeableAgent())->prompt('One.') . PHP_EOL;
echo (new FakeableAgent())->prompt('Two.') . PHP_EOL;
```

```text [Output]
First response
Echo: Two.
```

The closure receives the incoming `AgentPrompt`, so it can branch on the
prompt text. Structured agents accept plain arrays as faked responses and
return them as structured output; `AgentResponse::fakeWithPendingApprovals()`
fakes a paused turn, and `AgentResponse::fakeWithReasoning()` fakes a turn
with model reasoning.

## Asserting prompts

After prompting, assert what the agent received: exact text or a truth test
over the recorded `AgentPrompt`:

```php
use Crustum\Ai\Prompts\AgentPrompt;

FakeableAgent::fake(['First response']);
(new FakeableAgent())->prompt('Analyze this.');

FakeableAgent::assertPrompted('Analyze this.');
FakeableAgent::assertPrompted(fn (AgentPrompt $prompt) => $prompt->contains('Analyze'));
FakeableAgent::assertPromptedTimes(1);
FakeableAgent::assertNotPrompted('Missing prompt');
echo "asserted\n";
```

```text [Output]
asserted
```

`assertNeverPrompted()` fails the moment any prompt was recorded. Resumed
approval turns assert the same way. Inspect the recorded decisions with
`$prompt->hasApprovalDecisions()`. Call `preventStrayPrompts()` on the fake
to throw whenever the agent runs without a defined fake response left.

## Asserting queued prompts

Queued invocations record separately. Fake the agent, dispatch with
`queue()`, then assert against the recorded queue:

```php
FakeableAgent::fake(['Queued answer.']);
(new FakeableAgent())->queue('Analyze this quarter.');

FakeableAgent::assertQueued('Analyze this quarter.');
FakeableAgent::assertNotQueued('Missing prompt');
echo "queued\n";
```

```text [Output]
queued
```

`assertNeverQueued()` covers the negative case. Queue assertions observe the
same recorded prompts the worker would run. The job payload is unchanged.

## Asserting the whole flow

`AiFlow` records provider HTTP, tools, steps, streams, events, jobs, and
approvals around a run. The static calls work anywhere; the trait wires
capture reset into Pest and PHPUnit for free:

```php
use Crustum\Ai\Event\AgentPrompted;
use Crustum\Ai\TestSuite\AiFlow;
use PHPUnit\Framework\TestCase;

class FakeableAgentTest extends TestCase
{
    use \Crustum\Ai\TestSuite\AiFlowTrait;

    public function testPromptFlow(): void
    {
        $this->fakeProviderHttp(['*' => $this->httpResponse(['ok' => true])]);

        $response = (new \Crustum\Ai\AnonymousAgent('You are a probe.', [], []))
            ->prompt('Hi', provider: \Crustum\Ai\Enums\Lab::OpenAI);

        $this->assertHttpSentTo('POST api.openai.com/*');
        $this->assertHttpSentWithModel('gpt-5.4');
        $this->assertToolNotInvoked('SearchDocumentation');
        $this->assertNoPendingApprovals();
    }
}
```

The fake maps URL patterns (with optional method prefixes and wildcards) to
canned responses or ordered sequences via `httpSequence()`. Around the run,
assert what happened at every layer:

```php
use Crustum\Ai\Event\AgentPrompted;
use Crustum\Ai\TestSuite\AiFlow;

AiFlow::reset();
FakeableAgent::fake(['Hello.']);

$response = (new FakeableAgent())->prompt('Hi.');
AiFlow::observe($response);
AiFlow::assertAiEventDispatched(AgentPrompted::class);
echo $response->text . PHP_EOL;
```

```text [Output]
Hello.
```

`AiFlow::reset()` starts a clean capture; `observe()` (or `observeStream()`
for streamed runs) records the response's steps and usage for
`assertStepCount()`, `assertStepsContainTool()`,
`assertLastStepFinishReason()`, and `assertUsageAccumulated()`. Streams get
`assertStreamEmitted()`, `assertStreamSequence()`,
`assertStreamTextContains()`, and `assertStreamToolCall()`; approvals get
`assertPendingApproval()` / `assertNoPendingApprovals()` /
`assertApprovalDecision()`; failover gets `assertProviderFailedOver()`;
queues get `assertJobPushed()` / `assertNoJobsPushed()`. `getHttpRequests()`,
`getToolInvocations()`, `getSteps()`, `getStreamEvents()`, and
`getAiEvents()` return the recordings for custom checks.

## Where next

- [Agents](./index.md) — lifecycle and configuration
- [Middleware](./middleware.md) — asserting middleware ran with `AiFlow`
- [Error handling](./error-handling.md) — failures worth asserting
