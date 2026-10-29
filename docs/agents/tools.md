---
description: 'Tools: giving agents real capabilities that execute in your app.'
---

# Tools

Tools give agents capabilities that execute as real PHP in your application:
a tool call from the model runs your `handle()` method, and its return value
feeds back into the next step. A tool is a class implementing
`Crustum\Ai\Contracts\Tool` (`description()`, `schema()`, `handle()`).
Scaffold one with `bin/cake bake tool Shout`, or write it by hand:

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
            'text' => $schema->string()->description('Text to shout')->required(),
        ];
    }
}
```

```php [run.php]
use Crustum\Ai\AnonymousAgent;

$response = (new AnonymousAgent('You are a probe.', [], [new Shout()]))
    ->prompt('Shout hello.');

echo $response->text . PHP_EOL;
```

:::

```text [Output]
HELLO
```

The model called `Shout` with `{"text": "hello"}`; `handle()` ran locally;
`HELLO` came back as the tool result and the model answered with it.

## Overriding tools per run

`withTools()` replaces the agent's tool set for one run: a literal list, or
a closure receiving the declared tools to append or filter per tenant or
feature flag:

```php
use Crustum\Ai\AnonymousAgent;

$response = (new AnonymousAgent('You are a probe.', [], []))
    ->withTools([new Shout()])
    ->prompt('Shout hello.');

echo $response->text . PHP_EOL;
```

```text [Output]
HELLO
```

## Validating arguments

The schema tells the model the shape; `Request::validate()` enforces it.
When validation fails, the messages go back to the model as the tool result,
so it corrects the arguments and calls again:

::: code-group

```php [Forecast.php]
use Crustum\Ai\Contracts\Tool;
use Crustum\Ai\Tools\Request;
use Crustum\JsonSchema\Contracts\JsonSchema;

class Forecast implements Tool
{
    public function description(): string
    {
        return 'Forecast the weather for a city.';
    }

    public function handle(Request $request): string
    {
        $args = $request->validate([
            'city' => 'required|string',
            'days' => 'required|integer',
        ]);

        return $args['city'] . ' sunny for ' . $args['days'] . ' days.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'city' => $schema->string()->required(),
            'days' => $schema->string()->required(),
        ];
    }
}
```

```php [run.php]
use Crustum\Ai\Attributes\MaxSteps;
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasTools;
use Crustum\Ai\Trait\PromptableTrait;

// The validate → retry → answer loop takes three model steps,
// so the budget is raised explicitly.
#[MaxSteps(5)]
class ForecastAgent implements Agent, HasTools
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a probe.';
    }

    public function tools(): iterable
    {
        return [new Forecast()];
    }
}

$response = (new ForecastAgent())->prompt('Forecast Paris.');

echo $response->text . PHP_EOL;
```

:::

```text [Output]
Paris sunny for 3 days.
```

Pass a `Cake\Validation\Validator` instead of an array for the full
framework API (parameterized rules, custom messages and attribute names).
Tool schemas use the same builder as [structured output](./structured-output.md)
(nested objects, arrays, enums), so complex arguments stay typed.

Only validation failures go back to the model. Any other exception from
`handle()` aborts the whole run. Catch recoverable errors inside the tool
and return a message string instead. When one step holds several tool
calls, they run sequentially in the model's emission order.

## Reading files

`Crustum\Ai\Tools\Filesystem` holds local tools that run against a Flysystem
disk: `ReadFile`, `WriteFile`, `ListFiles`, `FileExists`, `GetFileMetadata`,
`GetFileUrl`, `CopyFile`, `MoveFile`, `DeleteFile`. Pass an operator or a
root path; `FileStorage::all('local')` / `readOnly('local')` bundle a whole
disk at once:

::: code-group

```php [run.php]
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Tools\Filesystem\ReadFile;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;

$files = new Filesystem(new LocalFilesystemAdapter(ROOT . DIRECTORY_SEPARATOR . 'storage'));

$response = (new AnonymousAgent('You are a probe.', [], [new ReadFile($files)]))
    ->prompt('Read notes.txt.');
echo $response->text . PHP_EOL;
```

:::

```text [Output]
Notes read.
```

Text-only results: files over 256KB or non-UTF-8 are refused with a message
(use `GetFileUrl` for those).

## Deferring tool definitions

Every exposed tool rides each request. With many tools, wrap the rarely used
ones in the `ToolSearch` provider tool (OpenAI, Azure, Anthropic). The
provider loads definitions on demand instead of carrying them all:

```php
use Crustum\Ai\Providers\Tools\ToolSearch;

public function tools(): iterable
{
    return [
        new Weather(),
        new ToolSearch(tools: [
            new SearchInvoices(),
            new RefundOrder(),
        ]),
    ];
}
```

Anthropic strategies: `regex` (default), `bm25`. Providers without tool
search throw instead of silently dropping the wrapped tools. Anthropic
requires at least one tool outside the wrapper.

## Searching similar documents

`SimilaritySearch` gives agents RAG over application tables: `usingModel()`
resolves a table (alias, instance, or class) whose `similarTo` finder comes
from the `Crustum/Ai.VectorSearch` behavior, or pass a closure returning the
matches. Tune with `minSimilarity`, `limit`, a query modifier, and an
optional `rerank()` pass:

```php
use Crustum\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel('Documents', 'embedding', minSimilarity: 0.7)
            ->withDescription('Search the knowledge base for relevant articles.'),
    ];
}
```

MCP servers expose their tools through `McpServerTool`. See the standalone
MCP block for that protocol; everything above runs server-side as plain tools.

## Reading files

## Repairing tool calls

Models sometimes call a tool that does not exist. `#[RepairToolCalls]`
sends the failed call back with the available tool names so the model
corrects itself (one extra step is added to the derived budget):

::: code-group

```php [LoudAgent.php]
use Crustum\Ai\Attributes\RepairToolCalls;
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasTools;
use Crustum\Ai\Trait\PromptableTrait;

#[RepairToolCalls]
class LoudAgent implements Agent, HasTools
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
$response = (new LoudAgent())->prompt('Shout hello.');
echo $response->text . PHP_EOL;
```

:::

```text [Output]
HELLO
```

## Where next

- [Agents](./index.md) — lifecycle and prompting
- [Provider tools](./provider-tools.md) — provider-side capabilities
- [Grouping tools](./toolsets.md) — bundles and collections
- [Approvals](./approvals.md) — human gates on tool calls
- [Sub-agents](./sub-agents.md) — delegation via `AgentTool`
