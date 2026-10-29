---
description: 'Middleware: wrapping each generation step to observe, rewrite, or stop the run.'
---

# Middleware

Middleware wraps each generation step before the model is called. A run that
takes three steps invokes the stack three times (once per step) for both
`prompt()` and `stream()`. Declare the stack on the agent class:

## Wrapping each step

Implement `Crustum\Ai\Contracts\HasMiddleware` and return the stack from
`middleware()`. Each entry is an object with a `handle()` method (or a
closure) receiving the `PendingStep` and the `$next` closure:

::: code-group

```php [LogSteps.php]
use Crustum\Ai\PendingStep;

class LogSteps
{
    public static array $seen = [];

    public function handle(PendingStep $step, Closure $next): mixed
    {
        self::$seen[] = $step->number;

        return $next($step);
    }
}
```

```php [StepAgent.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasMiddleware;
use Crustum\Ai\Trait\PromptableTrait;

class StepAgent implements Agent, HasMiddleware
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a probe.';
    }

    public function middleware(): array
    {
        return [new LogSteps()];
    }
}
```

```php [run.php]
$response = (new StepAgent())->prompt('Say hello.');
echo $response->text . PHP_EOL;
echo implode(',', LogSteps::$seen) . PHP_EOL;
```

:::

```text [Output]
Say hello back.
0
```

The single-step run invoked the middleware once, with step number `0`.

## Rewriting the step

The step carries everything about to be sent (provider, model,
instructions, messages, tools) plus what already happened: completed steps,
combined usage, and run progress:

```text
$step->provider        $step->model          $step->instructions
$step->messages        $step->tools           $step->steps
$step->usage           $step->number
$step->isFirstStep()   $step->isFinalStep
```

Each `with*` method returns a copy, leaving the original untouched. Drop an
expensive tool once the agent has used it:

```php
use Crustum\Ai\PendingStep;

class TrimTools
{
    public function handle(PendingStep $step, Closure $next): mixed
    {
        if (! $step->isFirstStep()) {
            $step = $step->withoutTools('SearchDocumentation');
        }

        return $next($step);
    }
}
```

The same shape narrows tools per step (`onlyTools()`, `withoutTools()`),
retargets the call (`withModel()`, `withInstructions()`, `withToolChoice()`,
`withMaxTokens()`, `withProviderOptions()`), or compacts a long loop by
summarizing the middle of the history:

```php
use Crustum\Ai\Agents\SummarizeAgent;
use Crustum\Ai\Messages\UserMessage;
use Crustum\Ai\PendingStep;

class CompactHistory
{
    public function handle(PendingStep $step, Closure $next): mixed
    {
        if (count($step->messages) > 40) {
            $contents = array_map(
                fn ($message) => (string)$message->content,
                array_slice($step->messages, 1, -10),
            );

            $summary = (new SummarizeAgent())->prompt(implode("\n", $contents))->text;

            $step = $step->withMessages(array_merge(
                [$step->messages[0]],
                [new UserMessage('Summary of the conversation so far: ' . $summary)],
                array_slice($step->messages, -10),
            ));
        }

        return $next($step);
    }
}
```

Messages passed to `withMessages()` change only the current step. Later
steps and the stored conversation keep the full, unsummarized history.

## Observing the answer

Call `then()` on the `$next()` result to run code once the model has
answered the step, before its tool calls execute. Works for synchronous and
streaming runs alike:

```php
use Crustum\Ai\Gateway\StepResponse;
use Crustum\Ai\PendingStep;

class LogAnswers
{
    public function handle(PendingStep $step, Closure $next): mixed
    {
        return $next($step)->then(function (StepResponse $response) {
            echo $response->text . PHP_EOL;
        });
    }
}
```

Outer middleware still observes inner short-circuits: the `then()` callback
receives whatever `StepResponse` the inner layer produced, whether it
streamed, short-circuited, or replaced the step.

## Short-circuiting and stopping

Return a `StepResponse` instead of calling `$next()` to answer the step
without invoking the model, for example serving a cached answer.
Middleware must return the `$next()` result or a `StepResponse`; anything
else throws a `LogicException`:

```php
use Crustum\Ai\Gateway\StepResponse;
use Crustum\Ai\PendingStep;
use Crustum\Ai\Responses\Data\FinishReason;
use Crustum\Ai\Responses\Data\Meta;
use Crustum\Ai\Responses\Data\TextUsage;

class ServeCached
{
    public function handle(PendingStep $step, Closure $next): mixed
    {
        if ($step->isFirstStep()) {
            return new StepResponse('Cached answer', [], FinishReason::Stop, new TextUsage(), new Meta());
        }

        return $next($step);
    }
}
```

The built-in `Crustum\Ai\Middleware\Stop` ends the run before the next
model call. `Stop::when()` stops where its condition holds,
`Stop::unless()` stops everywhere else:

::: code-group

```php [StoppedAgent.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasMiddleware;
use Crustum\Ai\Middleware\Stop;
use Crustum\Ai\Trait\PromptableTrait;

class StoppedAgent implements Agent, HasMiddleware
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a probe.';
    }

    public function middleware(): array
    {
        return [Stop::when(true)];
    }
}
```

```php [run.php]
$response = (new StoppedAgent())->prompt('Say hello.');
echo $response->text === '' ? "stopped\n" : $response->text . PHP_EOL;
echo count($response->steps) . " steps\n";
```

:::

```text [Output]
stopped
0 steps
```

Stopped before the first step, the run keeps no steps and an empty text. A
stop after tool calls keeps the steps and tool results recorded so far; a
stopped stream ends with a cancelled finish reason.

## Where next

- [Agents](./index.md) — lifecycle and configuration
- [Testing](./testing.md) — asserting middleware ran with `AiFlow`
- [Observability](./observability.md) — step events for logging instead of middleware
