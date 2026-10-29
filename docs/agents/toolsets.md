---
description: 'Grouping tools: bundles and collections instead of a toolset class, filtered and merged as plain iterables.'
---

# Grouping tools

There is no toolset class. A bundle is whatever `tools()` returns (any
iterable), so grouping is plain PHP: arrays merged in a helper, factory
collections filtered per tenant, wrappers around the rarely used. The
patterns below are the whole mechanism.

## Bundling a disk

`FileStorage::all()` / `readOnly()` return the filesystem tools for one
disk as a collection: read, list, inspect, link, write, delete, copy,
move:

```php
use Crustum\Ai\Tools\FileStorage;
use Crustum\Ai\Tools\ToolNameResolver;

$names = FileStorage::readOnly()
    ->map(fn ($tool) => ToolNameResolver::resolve($tool))
    ->toList();
sort($names);
echo implode(',', $names) . PHP_EOL;
```

```text [Output]
FileExists,GetFileMetadata,GetFileUrl,ListFiles,ReadFile
```

Names resolve from `name()` when the tool defines one, otherwise from the
class basename. Handy for logging which bundle an agent actually carries.

## Filtering a bundle

Collections filter like any other: drop the destructive tools for a
read-only agent, or per tenant and feature flag:

```php
use Crustum\Ai\Tools\FileStorage;
use Crustum\Ai\Tools\Filesystem\DeleteFile;

public function tools(): iterable
{
    return FileStorage::all('s3')
        ->reject(fn ($tool) => $tool instanceof DeleteFile);
}
```

`withTools()` replaces the set for one run the same way. See
[Overriding tools per run](./tools.md#overriding-tools-per-run).

## Merging by hand

`tools()` takes any iterable, so small helpers compose: shared tools plus
the agent's own, concatenated. Nothing registers, nothing syncs. The next
run reads the method again.

## Where next

- [Tools](./tools.md) — authoring, validation, repair
- [Provider tools](./provider-tools.md) — provider-side capabilities
- [Skills](./skills.md) — instructions loaded on demand
