---
description: 'MCP servers: the central class exposing tools, resources, prompts over web or STDIO.'
---

# Servers

A server is the central communication point: one class advertising tools,
resources, and prompts to AI clients. Bake it (see [Commands](./commands.md)),
list its primitives, register it for web and/or local use.

## Server class

```php
namespace App\Mcp\Servers;

use App\Mcp\Tools\CurrentWeatherTool;
use Crustum\Mcp\Server;
use Crustum\Mcp\Server\Attributes\Instructions;
use Crustum\Mcp\Server\Attributes\Name;
use Crustum\Mcp\Server\Attributes\Version;

#[Name('Weather Server')]
#[Version('1.0.0')]
#[Instructions('This server provides weather information and forecasts.')]
class WeatherServer extends Server
{
    protected array $tools = [
        CurrentWeatherTool::class,
    ];

    protected array $resources = [
    ];

    protected array $prompts = [
    ];
}
```

`#[Name]`, `#[Version]`, and `#[Instructions]` advertise metadata during the
MCP initialize handshake. Instructions tell the model which tools to prefer.
Entries may be class strings or instances (for constructor arguments the
container cannot resolve itself).

## Web registration

```php
public function register(RouteBuilder $routes): void
{
    Registrar::getInstance()->web($routes, '/mcp/weather', WeatherServer::class);
}
```

Pass middleware as the fourth argument to protect the route (see
[Auth](./auth.md) for Tessera OAuth 2.1 and bearer options). The same server also declares via configuration instead of route
code:

```php
return [
    'Mcp' => [
        'Servers' => [
            [
                'route' => 'mcp/weather',
                'server' => WeatherServer::class,
                'middleware' => [],
            ],
        ],
    ],
];
```

HTTP traffic is handled by `Crustum\Mcp\Controller\ServerController`.

## Local registration

```php
public function register(): void
{
    Registrar::getInstance()->local('weather', WeatherServer::class);
}
```

Or via configuration:

```php
return [
    'Mcp' => [
        'local' => [
            'weather' => WeatherServer::class,
        ],
    ],
];
```

The `weather` handle is what `mcp start weather` boots. The same
`WeatherServer` class can be both a web route and a local handle. Remote
clients use HTTP while an IDE uses STDIO, with no duplicated primitives.

## Cache hints

```php
namespace App\Mcp\Servers;

use Crustum\Mcp\Enums\CacheScope;
use Crustum\Mcp\Server;
use Crustum\Mcp\Server\Attributes\Cacheable;

#[Cacheable(ttlMs: 60000, scope: CacheScope::Public)]
class WeatherServer extends Server
{
    protected function cacheHints(): array
    {
        return [
            'tools/list' => new Cacheable(ttlMs: 30000, scope: CacheScope::Public),
        ];
    }
}
```

`CacheScope::Private` limits cached responses to the same authorization
context; `CacheScope::Public` allows sharing between users. Method hints win
over the class attribute, and a resource-level `#[Cacheable]` wins over both.
Hints are advisory. The client decides what is actually cached.

## Where next

- [Commands](./commands.md) — bake and run commands
- [Tools](./tools.md) — fill the `$tools` array
- [Clients](./clients.md) — call other servers from your app
