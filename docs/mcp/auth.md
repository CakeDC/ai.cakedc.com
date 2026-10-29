---
description: 'MCP auth: protect servers with Tessera OAuth 2.1 or bearer tokens, harden for production.'
---

# Auth

Web MCP endpoints are **unauthenticated until you attach middleware**.
Local STDIO servers trust the process boundary; HTTP is the public surface.
Every production web server needs an auth entry in its middleware list (see
[Servers](./servers.md)). Two approaches: OAuth 2.1 via Tessera, or a
bearer-token middleware of your own.

## Tessera OAuth 2.1

Tessera acts as the OAuth authorization server. Register the discovery and
dynamic client registration routes, then list an API authentication middleware
on the web server:

```php
public function mcpRoutes(RouteBuilder $routes): void
{
    Registrar::getInstance()->oauthRoutes($routes);

    Registrar::getInstance()->web($routes, '/mcp/weather', WeatherServer::class, [
        'authentication',
    ]);
}
```

`oauthRoutes()` serves the `.well-known` metadata endpoints and the dynamic
client registration route, and registers the `mcp:use` scope
(`Registrar::OAUTH_SCOPE`) with Tessera. Authorize and token endpoints
typically live on Tessera (`/oauth/*`); clients discover them through the
plugin metadata. Point the issuer at your app:

```php
return [
    'Mcp' => [
        'authorization_server' => env('APP_FULL_BASE_URL'),
        'oauth' => [
            'enabled' => true,
            'prefix' => 'oauth',
            'authorization_endpoint' => null,
            'token_endpoint' => null,
        ],
    ],
];
```

For token verification on the MCP route itself, register the plugin middleware
alias (not applied globally) and list it on the server:

```php
return [
    'Mcp' => [
        'tesseraOAuth' => [
            'class' => TesseraOAuthMiddleware::class,
            'apply' => false,
        ],
    ],
];
```

`TesseraOAuthMiddleware` validates the Bearer token, requires the `mcp:use`
scope, answers 401/403 as JSON, and exposes the principal as
`mcp.oauth.identity` (plus `identity` when the subject resolves through the
users table). Cake Authentication can clear the request `identity` on bearer
API calls, so wire the shipped listener and tools keep seeing the principal
through `$request->getIdentity()`:

```php
public function wireIdentity(): void
{
    EventManager::instance()->on(
        McpRequestBuildingEvent::NAME,
        fn($event) => TesseraOAuthMiddleware::applyIdentity($event),
    );
}
```

On CakeDC Auth hosts, merge the plugin permissions fragments so anonymous
JSON-RPC is not redirected to HTML login. The MCP fragment covers the OAuth
metadata/register controllers, Tessera's covers authorize/token/consent, both
already `bypassAuth`:

```php
public function permissions(array $permissions): array
{
    return array_merge(
        $permissions,
        require Plugin::path('Crustum/Tessera') . 'config' . DS . 'permissions.php',
        require Plugin::path('Crustum/Mcp') . 'config' . DS . 'permissions.php',
    );
}
```

Prefer OAuth when clients support it. It is the documented authentication
mechanism in the Model Context Protocol specification.

## Bearer tokens

Without the full OAuth dance, attach a middleware validating
`Authorization: Bearer <token>` on the MCP web route. The plugin ships no
default bearer middleware. The host application provides the integration
matching its token store. To surface the principal inside tools, listen for
the request-building event and set the identity on the mutable MCP request;
tools then read `$request->getIdentity()`. For Tessera-protected routes use
the shipped `applyIdentity` listener above instead of hand-rolling it.

## Authorization

Authentication says who is calling; tools still decide what is allowed:

```php
public function gate(Request $request): Response
{
    $identity = $request->getIdentity();

    if ($identity === null || !method_exists($identity, 'can') || !$identity->can('read-weather')) {
        return Response::error('Permission denied.');
    }

    return Response::text('Authorized weather data.');
}
```

## Production hardening

```php
return [
    'Mcp' => [
        'require_web_auth_middleware' => true,
        'redirect_domains' => [
            'https://app.example.com',
            'http://localhost',
        ],
    ],
];
```

- **Auth every public web server.** With `require_web_auth_middleware` on,
  empty middleware lists fail at registration; with debug on and the flag
  off, the registrar only logs a warning.
- **Restrict DCR redirect domains.** The default `['*']` accepts any HTTPS
  redirect (convenient for local tooling); production wants an explicit
  allowlist or pre-registered Tessera clients.
- **Treat OAuth `return_to` as untrusted.** Prefer handlers that redirect to
  a fixed app path over restored query values on public sites.

## Where next

- [Servers](./servers.md) — registration and transports
- [Clients](./clients.md) — the other direction: calling external servers
