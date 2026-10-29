---
description: 'MCP client: connect your app to other servers, call tools, read resources.'
---

# Clients

The plugin also connects **out**: your application becomes the MCP client of
a first-party or third-party server, for example a chat app answering questions about a
user's repositories. No server of your own is needed.

## Connecting

```php
public function clients(): array
{
    return [
        Client::web('https://api.githubcopilot.com/mcp/'),
        Client::local('php', ['mcp', 'start', 'weather']),
    ];
}
```

The local form takes the command plus its arguments: typically the PHP
binary with `bin/cake.php mcp start <handle>` (see
[Commands](./commands.md)). Connections are lazy. The first list/call dials.
Manage manually when needed:

```php
public function probe(Client $client): array
{
    $client->connect();
    $client->ping();

    if ($client->connected()) {
        return [$client->capabilities(), $client->serverInfo()];
    }

    $client->disconnect();

    return [];
}
```

Tune the request timeout per client:

```php
public function timedClient(): Client
{
    return Client::web('https://api.githubcopilot.com/mcp/')->withTimeout(30);
}
```

## Named clients

```php
public function registerClients(): void
{
    ClientManager::getInstance()->registerClient(
        'github',
        fn() => Client::web('https://api.githubcopilot.com/mcp/'),
    );
}
```

Resolve anywhere by name; the manager disconnects at process shutdown:

```php
public function github(): Client
{
    return ClientManager::getInstance()->client('github');
}
```

## Authentication

Bearer tokens attach directly: pass a string, or a closure resolving the
current user's token at call time:

```php
public function bearerClient(string $token): Client
{
    return Client::web('https://api.githubcopilot.com/mcp/')->withToken($token);
}
```

For per-user OAuth against an external service, pair `withOAuth` (your app's
client credentials) with `withToken` (the connected user's saved access
token), then register the account-linking routes so the connect route sends
the user to the consent screen and the callback persists the resulting
`TokenSet`:

```php
public function linkAccount(RouteBuilder $routes): void
{
    Registrar::getInstance()->oAuthRoutesFor(
        $routes,
        'projects',
        function (string $client, TokenSet $token): Response {
            return (new Response())->withLocation('/chat');
        },
        ['auth'],
    );
}
```

This registers connect, callback, and client-metadata routes under
`mcp.oauth.{client}.*`. Store tokens encrypted, keep `refreshToken`/`expiresAt`
for renewals.

## Tools, prompts, resources

```php
public function catalog(Client $client): array
{
    $names = [];

    foreach ($client->tools() as $tool) {
        $names[] = [$tool->name, $tool->title, $tool->description];
    }

    return $names;
}
```

Pagination is automatic; `tools(limit: 10)` caps the listing. Invoke by name.
The `ToolResult` exposes text, error state, and structured content:

```php
public function issues(Client $client): ToolResult
{
    return $client->callTool('list_issues', [
        'owner' => 'octocat',
        'repo' => 'hello-world',
    ]);
}
```

The `ToolResult` exposes text, error state, and structured content
(`text()`, `isError`, `structuredContent`). Or call from a listed instance:
`$tools['list_issues']->call([...])`.
Prompts (`prompts()` / `getPrompt()`) and resources (`resources()` /
`readResource($uri)`) follow the same list-then-use shape with the same
`limit` option.

## Where next

- [Servers](./servers.md) — expose your own server instead
- [MCP tools](./../agents/mcp-link.md) — MCP tools inside agents
