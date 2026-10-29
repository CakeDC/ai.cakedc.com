---
description: 'MCP apps: interactive HTML experiences rendered from tools in sandboxed iframes.'
---

# Apps

MCP Apps let a tool render an interactive HTML application (dashboards,
forms, visualizations) inside a sandboxed iframe in supporting hosts. An app
is two parts: an **app resource** returning self-contained HTML, and a
**tool** linked to it with `#[RendersApp]`. When the tool is called, the host
fetches the resource and renders it.

## App resource

```bash
bin/cake bake mcp_app_resource WeatherDashboardApp
```

The generated class extends `AppResource`, which fixes the `ui://` URI scheme
and the `text/html;profile=mcp-app` MIME type required by the spec. Render
through the plugin layout so the iframe can talk back to the server:

```php
namespace App\Mcp\Resources;

use Crustum\Mcp\Request;
use Crustum\Mcp\Response;
use Crustum\Mcp\Server\AppResource;
use Crustum\Mcp\Server\Attributes\AppMeta;
use Crustum\Mcp\Server\Attributes\Description;

#[Description('An interactive weather dashboard.')]
#[AppMeta]
class WeatherDashboardApp extends AppResource
{
    public function handle(Request $request): Response
    {
        return Response::view('Mcp/weather_dashboard_app', [
            'title' => $this->title(),
        ], [], 'Crustum/Mcp.mcp_app');
    }
}
```

Like any resource, register it in the server's `$resources` array. The plugin
advertises the `io.modelcontextprotocol/ui` extension capability automatically
once an `AppResource` is registered. No extra server configuration.

## Linking a tool

```php
namespace App\Mcp\Tools;

use App\Mcp\Resources\WeatherDashboardApp;
use Crustum\Mcp\Request;
use Crustum\Mcp\Response;
use Crustum\Mcp\Server\Attributes\RendersApp;
use Crustum\Mcp\Server\Tool;

#[RendersApp(resource: WeatherDashboardApp::class)]
class ShowWeatherDashboard extends Tool
{
    public function handle(Request $request): Response
    {
        return Response::text('Weather dashboard loaded.');
    }
}
```

### Visibility

Each `#[RendersApp]` tool can limit who may invoke it. `[Visibility::App]`
marks backend actions the UI calls directly (loading data) without exposing
them to the model; `[Visibility::Model]` hides a tool from the UI. The default
is both:

```php
use Crustum\Mcp\Server\Attributes\RendersApp;
use Crustum\Mcp\Server\Tool;
use Crustum\Mcp\Server\Ui\Enums\Visibility;

#[RendersApp(resource: WeatherDashboardApp::class, visibility: [Visibility::App])]
class GetWeatherData extends Tool
{
}
```

## App configuration

`#[AppMeta]` on the resource configures the iframe Content Security Policy,
browser permissions, and library scripts injected into the view `<head>`:
`connectDomains` (extra fetch hosts), `permissions` (browser permissions such
as `Permission::Geolocation`), and `libraries` (pre-configured CDN scripts
such as `Library::Tailwind` or `Library::Alpine`, whose origins merge into
the CSP automatically). For computed or dynamic
configuration, override `appMeta` with the fluent `AppMeta`, `Csp`, and
`Permissions` builders from `Crustum\Mcp\Server\Ui`. App authors working with
a coding agent can scaffold resource + template + tool via the
`mcp-development` skill shipped with the plugin.
For the client-side API and schema, the package points at the official MCP
Apps specification.

## Where next

- [Tools](./tools.md) — responses and tool authoring
- [Servers](./servers.md) — register the app resource
