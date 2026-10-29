---
description: 'Provider tools: web search, page fetch, file search, and sandboxed code execution run by the provider.'
---

# Provider tools

Some capabilities run better on the provider's side: live web search,
reading a page, searching uploaded files, executing code in a sandbox.
`Crustum\Ai\Providers\Tools` holds these: classes extending `ProviderTool`
that travel in the agent's `tools()` list exactly like local tools, but the
provider executes them and the result feeds back into the run. What you own
is the payload: which tool, its options, and which providers may run it.

## Searching the web

`WebSearch` asks the provider for live results: current events, recent
data, anything past the model's cutoff:

```php
use Crustum\Ai\Providers\Tools\WebSearch;

$search = (new WebSearch())
    ->max(5)
    ->allow(['cakephp.org'])
    ->location(city: 'Berlin', country: 'DE');

echo $search->maxSearches . PHP_EOL;
echo implode(',', $search->allowedDomains) . PHP_EOL;
echo $search->city . ' ' . $search->country . PHP_EOL;
```

```text [Output]
5
cakephp.org
Berlin DE
```

Supported by: Anthropic, OpenAI, Azure, Gemini, xAI, Groq, OpenRouter.

## Fetching pages

`WebFetch` reads specific URLs instead of searching. Give it to the agent
when the addresses are already known:

```php
use Crustum\Ai\Providers\Tools\WebFetch;

public function tools(): iterable
{
    return [
        (new WebFetch())->max(3)->allow(['book.cakephp.org']),
    ];
}
```

Supported by: Anthropic, Gemini, OpenRouter.

## Searching files

`FileSearch` queries [vector stores](../providers/embeddings.md) by id:
retrieval over uploaded documents without moving the data through your app:

```php
use Crustum\Ai\Providers\Tools\FileSearch;
use Crustum\Ai\Providers\Tools\FileSearchQuery;

$tool = new FileSearch(stores: ['store_1'], where: fn (FileSearchQuery $query) => $query
    ->where('author', 'Larry Masters')
    ->whereNot('status', 'draft'));

echo implode(',', $tool->ids()) . PHP_EOL;
echo json_encode($tool->filters) . PHP_EOL;
```

```text [Output]
store_1
[{"type":"eq","key":"author","value":"Larry Masters"},{"type":"ne","key":"status","value":"draft"}]
```

`stores` takes ids or `Store` instances (`ids()` normalizes either way).
`where` takes an equality array or a `FileSearchQuery` closure (`where`,
`whereNot`, `whereIn`, `whereNotIn`).

Supported by: OpenAI, Azure, Gemini, xAI.

## Running code

`CodeExecution` runs code in a provider-hosted sandbox: calculations and
data analysis the model should not guess at:

```php
use Crustum\Ai\Providers\Tools\CodeExecution;

public function tools(): iterable
{
    return [new CodeExecution()];
}
```

On OpenAI or Azure, stored files reach the sandbox through provider options:

```php
use Crustum\Ai\Providers\Tools\CodeExecution;

public function tools(): iterable
{
    return [
        (new CodeExecution())->withProviderOptions([
            'container' => ['type' => 'auto', 'file_ids' => ['file_123']],
        ]),
    ];
}
```

`withProviderOptions()` lives on the `ProviderTool` base, so every provider
tool accepts it; closures receive the provider and must only capture
serializable values. Supported by: Anthropic, OpenAI, Azure, Gemini, xAI,
Groq.

## Deferring definitions

Every exposed tool rides each request (see
[Deferring tool definitions](./tools.md#deferring-tool-definitions)). The
`ToolSearch` wrapper defers a subset instead. The provider loads them on
demand. `strategy` is `regex` (default) or `bm25`; anything else throws on
construction:

```php
use Crustum\Ai\Providers\Tools\ToolSearch;

public function tools(): iterable
{
    return [
        new SearchInvoices(),
        new ToolSearch(tools: [new RefundOrder()], strategy: 'bm25'),
    ];
}
```

At most one wrapper per request. A second throws. Supported by: OpenAI,
Azure, Anthropic.

## When the provider cannot run it

Support is a contract check: each gateway maps a provider tool only when
the provider implements its `Supports*` interface (`SupportsWebSearch`,
`SupportsWebFetch`, `SupportsFileSearch`, `SupportsCodeExecution`,
`SupportsToolSearch`). Anything else never reaches the wire. Local tools
pass through untouched, unsupported provider tools are dropped, and a
`ToolSearch` on a provider without support unwraps to its plain tools:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Providers\Tools\WebSearch;

$response = (new AnonymousAgent('You are a probe.', [], [new WebSearch()]))
    ->prompt('What is new in CakePHP 5?');

echo $response->text . PHP_EOL;
```

```text [Output]
Answered without web search.
```

The run above completes with the search silently dropped. The model
answers from its own knowledge instead of failing.

## Where next

- [Tools](./tools.md) — local tool authoring, validation, deferring
- [Grouping tools](./toolsets.md) — bundles and collections
- [Sub-agents](./sub-agents.md) — delegation via `AgentTool`
