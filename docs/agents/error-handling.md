---
description: 'Error handling: exception hierarchy, catch ordering, failover, and timeouts.'
---

# Error handling

Every agent failure surfaces as `Crustum\Ai\Exception\AiException`, with one
exception: tool argument validation throws
`Crustum\Ai\Exception\ValidationException`
(a plain `Exception`). Catch the specific problems before the base class:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Exception\AiException;
use Crustum\Ai\Exception\NoSuchToolException;

try {
    $text = (new AnonymousAgent('You are a probe.', [], []))->prompt('Say hello.')->text;
} catch (NoSuchToolException $e) {
    $text = 'unknown tool';
} catch (AiException $e) {
    $text = 'fallback';
}
echo $text . PHP_EOL;
```

```text [Output]
Say hello back.
```

Ordering matters: every agent exception extends the base, so a leading
`catch (AiException)` would swallow the specific cases below it.

## The hierarchy

- `AiException`: the base. Everything agent-related extends it.
- `NoSuchToolException`: the model called a tool the agent does not have.
  Fix the tool list or the model, retrying will not help.
- `ApprovalNotResumableException`: a tool paused for approval on a run
  whose history cannot be resumed. Resumable runs need a `Conversational`
  agent or frontend-supplied history.
- `StoppedException`: a stream stopped via its stop check.
- `StreamErrorException`: a streamed response failed mid-flight.
- `EmbeddingsCountMismatchException`: an embeddings batch came back short.
- `ValidationException`: tool arguments failed validation. Note the parent is
  plain `Exception`, so `catch (AiException)` misses it. Catch it
  separately when tools are involved.
- `RateLimitedException`, `ProviderOverloadedException`,
  `ProviderConnectionException`, `InsufficientCreditsException` are transient
  provider failures. Each implements `FailoverableException` and triggers
  failover when a backup provider is configured.

## Failover and retries

Pass a provider list and a transient failure moves the run to the next
provider instead of throwing: `prompt('Hi', provider: [Lab::OpenAI,
Lab::Anthropic])`, optionally with per-provider models. Ordinary errors such
as bad requests, validation and unknown tools never fail over.

Rate limits respect the provider's `Retry-After` delay first: a `429` waits
out the delay and retries the same provider, failing over only if the retry
also fails. Each hop dispatches its event (`AgentFailedOver`,
`ProviderFailedOver`), and the terminal failure dispatches `AgentFailed`.

## Timeouts

Each call accepts a `timeout` in seconds (default `60`), overridable per
agent via a `timeout()` method or the `Timeout` attribute. A timeout throws
like any other transport failure. Catch it under `AiException`; it stays
failover-eligible when the provider marks it retryable.

## Where next

- [Testing](./testing.md) — faking failures with `AiFlow`
- [Observability](./observability.md) — listening for `AgentFailed` and step failures
- [Middleware](./middleware.md) — guarding runs before the model is called
