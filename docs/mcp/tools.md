---
description: 'MCP tools: authoring, schemas, validation, injection, responses, catalogs.'
---

# Tools

Tools let servers expose callable functionality: the model invokes them, your
`handle()` runs, the response goes back. Register each tool in the server's
`$tools` array (see [Servers](./servers.md)).

## Authoring

```php
namespace App\Mcp\Tools;

use Crustum\JsonSchema\Contracts\JsonSchema;
use Crustum\Mcp\Request;
use Crustum\Mcp\Response;
use Crustum\Mcp\Server\Attributes\Description;
use Crustum\Mcp\Server\Tool;

#[Description('Fetches the current weather forecast for a specified location.')]
class CurrentWeatherTool extends Tool
{
    public function handle(Request $request): Response
    {
        $location = $request->get('location');

        return Response::text('The weather is sunny in ' . $location . '.');
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'location' => $schema->string()
                ->description('The location to get the weather for.')
                ->required(),
            'units' => $schema->string()
                ->enum(['celsius', 'fahrenheit'])
                ->description('The temperature units to use.')
                ->default('celsius'),
        ];
    }
}
```

Names derive from the class (`CurrentWeatherTool` → `current-weather`);
override with `#[Name]` / `#[Title]`. The description is what helps the model
decide when to call the tool. Always set one.

## Validation and injection

```php
namespace App\Mcp\Tools;

use App\Service\WeatherService;
use Cake\Validation\Validator;
use Crustum\Mcp\Request;
use Crustum\Mcp\Response;
use Crustum\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    public function __construct(
        protected WeatherService $weather,
    ) {
    }

    public function handle(Request $request): Response
    {
        $validator = new Validator();
        $validator
            ->requirePresence('location')
            ->notEmptyString('location')
            ->maxLength('location', 100);

        $validated = $request->validateWith($validator);

        return Response::text('Forecast ready for ' . $validated['location']);
    }
}
```

Schema shape is the first gate; `validateWith()` is the strict one. Write messages clients can act on. Constructor and `handle()` arguments
both resolve through the container (`WeatherService` above is injected, not
constructed).

## Annotations and conditional registration

```php
namespace App\Mcp\Tools;

use Crustum\Mcp\Request;
use Crustum\Mcp\Server\Tool;
use Crustum\Mcp\Server\Tools\Annotations\IsIdempotent;
use Crustum\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsIdempotent]
#[IsReadOnly]
class CurrentWeatherTool extends Tool
{
    public function shouldRegister(?Request $request = null): bool
    {
        $identity = $request?->getIdentity();

        return $identity !== null && method_exists($identity, 'isSubscribed') && $identity->isSubscribed();
    }
}
```

Available annotations: `#[IsReadOnly]`, `#[IsDestructive]`,
`#[IsIdempotent]`, `#[IsOpenWorld]` (each takes an explicit boolean).
`shouldRegister()` returning `false` hides the tool from listing and
invocation: the per-request identity gate.

## Responses

Tools return `Crustum\Mcp\Response`: `Response::text()`,
`Response::error()`, `Response::image()` / `Response::audio()`,
`Response::html()` (relative to app `ROOT`), `Response::view()` (CakePHP
templates), `Response::structured()` (parseable payload with a JSON-text
fallback), `Response::resourceLink()`, `Response::blob()`. Arrays of
responses return multiple content parts; generators stream. Each yielded
`Response::notification()` opens an SSE progress stream on web servers.

## Searchable catalogs

Servers with many tools keep some in a searchable catalog instead of
advertising everything: `search_tools` finds tools by name, description, and
schema; `execute_tools` invokes the found ones.

```php
namespace App\Mcp\Servers;

use App\Mcp\Tools\CurrentWeatherTool;
use App\Mcp\Tools\HistoricalWeatherTool;
use App\Mcp\Tools\WeatherAlertsTool;
use Crustum\Mcp\Server;
use Crustum\Mcp\Server\Tools\ToolSearch;

class WeatherServer extends Server
{
    protected array $tools = [
        CurrentWeatherTool::class,

        ToolSearch::class => [
            HistoricalWeatherTool::class,
            WeatherAlertsTool::class,
        ],
    ];
}
```

`CurrentWeatherTool` is advertised directly; the other two are reachable
through search + execute. Limits come from
`Mcp.tool_search.max_tool_calls` / `Mcp.tool_search.max_output_bytes`.
Conditional registration still applies inside the catalog.

## Where next

- [Servers](./servers.md) — registration and transports
- [Apps](./apps.md) — render a UI from a tool
- [Clients](./clients.md) — call tools on other servers
