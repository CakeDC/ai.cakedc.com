---
title: Panifex extending
description: Custom tools and agents, subagents, hooks, events, providers and models.
---

# Extending

Panifex is built to be extended without forking: new tools for your domain, new agents for your workflow, deterministic hooks around everything, and events for observability. Bake commands scaffold the boilerplate (verified in `src/Command/BakeToolCommand.php`, `BakeAgentCommand.php`, `BakeEvalCommand.php`).

## Custom tools

Scaffold one, then implement it:

```bash
bin/cake coder tool ReadDatabase
```

```php
// src/Tool/ReadDatabase.php (project code shown in CakePHP style)
namespace App\Ai\Tools;

use Crustum\Ai\Tools\Request;
use Crustum\JsonSchema\Contracts\JsonSchema;
use Crustum\Panifex\Tool\AbstractTool;

class ReadDatabase extends AbstractTool
{
    public function description(): string
    {
        return 'Run a read-only SQL query and return results as JSON. SELECT only.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('The SELECT query to run.')
                ->required(),
        ];
    }

    public function handle(Request $request): string
    {
        $sql = $request->string('query', '');

        if (! str_starts_with(strtolower(ltrim($sql)), 'select')) {
            return 'Only SELECT queries are allowed.';
        }

        // Run against the CakePHP connection and return JSON.
        return json_encode($this->fetchAll($sql), JSON_PRETTY_PRINT);
    }
}
```

Every tool receives a request bag in `handle()`: string, boolean, and integer accessors plus raw and all-arguments access. When a tool should refuse an action, **return a string explaining why** rather than throwing an exception: the agent reads the refusal message and reroutes itself accordingly. Only validation failures go back to the model for retry; any other exception from `handle()` aborts the whole run. Catch recoverable errors inside the tool and return a message string instead.

Wire a custom tool into an agent by extending the coding agent:

```bash
bin/cake coder agent MyCodingAgent
```

```php
// A MyCodingAgent extending DefaultCodingAgent, adding the tool:
public function tools(): iterable
{
    return [...parent::tools(), $this->readDatabase];
}
```

The container resolves all constructor dependencies automatically, so a tool class can type-hint anything it needs (connections, services). Custom agents that replace `tools()` must include project tools explicitly or call `parent::tools()`; lean agents keep their narrower lists. MCP-served tools are configured separately in `Panifex.mcp.tools`.

## Custom agents

```bash
# Scaffold an agent that extends DefaultCodingAgent (most common)
bin/cake coder agent MyAgent

# Scaffold a bare CodingAgentInterface implementation
bin/cake coder agent MyAgent --full
```

An agent is a class implementing `CodingAgentInterface` (`src/Contract/CodingAgentInterface.php`) that receives a prompt, calls tools, and returns a result. Two shapes, both verified against `src/Agent/`:

**1. Extend the default agent**: inherit the full harness (instructions, tool loop, guards, events) and change only the persona. No constructor needed; the attribute-resolving container injects the parent's dependencies automatically:

```php
// src/Ai/DocsAgent.php
namespace App\Ai;

use Crustum\Panifex\Agent\DefaultCodingAgent;
use Stringable;

class DocsAgent extends DefaultCodingAgent
{
    public function instructions(): Stringable|string
    {
        return parent::instructions() . <<<'EXTRA'

        ## Documentation rules for this project

        1. Every docs page starts with `description:` frontmatter, one line, under 140 chars.
        2. Never emit raw tag placeholders — even inside code spans, the docs build breaks on them.
        3. Prefer tables over paragraphs for options; prose for concepts.
        4. Verify every command flag against src/ before writing it down.
        EXTRA;
    }
}
```

Wire it in your application services so commands resolve it instead of the default. The plugin binds the contract to the default (`PanifexServiceProvider::registerContracts`), so rebind both the contract and the concrete class the commands type-hint:

```php
// config/services.php (or your Application::services())
use App\Ai\DocsAgent;
use Crustum\Panifex\Agent\DefaultCodingAgent;
use Crustum\Panifex\Contract\CodingAgentInterface;

$container->add(CodingAgentInterface::class, static fn() => $container->get(DocsAgent::class));
$container->add(DefaultCodingAgent::class, static fn() => $container->get(DocsAgent::class));
```

**2. Implement the contract directly**: a narrow agent with exactly the tools it needs, modeled on `src/Agent/ExplorerAgent.php`. This one answers schema questions for the main agent via `Delegate`:

```php
// src/Ai/SchemaExpertAgent.php
namespace App\Ai;

use Crustum\Ai\Attributes\MaxSteps;
use Crustum\Ai\Attributes\RepairToolCalls;
use Crustum\Ai\Trait\PromptableTrait;
use Crustum\Panifex\Agent\Trait\CachesInstructionsTrait;
use Crustum\Panifex\Attribute\AiModel;
use Crustum\Panifex\Attribute\AiProvider;
use Crustum\Panifex\Attribute\Workspace;
use Crustum\Panifex\Contract\CodingAgentInterface;
use Crustum\Panifex\Guard\PathGuard;
use Crustum\Panifex\Support\BudgetTracker;
use Crustum\Panifex\Support\HookRunner;
use Crustum\Panifex\Tool\DescribeSchema;
use Crustum\Panifex\Tool\DescribeTables;
use Crustum\Panifex\Tool\EventedTool;
use Crustum\Panifex\Tool\QueryDatabase;

#[MaxSteps(10)]
#[RepairToolCalls]
class SchemaExpertAgent implements CodingAgentInterface
{
    use CachesInstructionsTrait;
    use PromptableTrait;

    public function __construct(
        #[Workspace] private readonly PathGuard $pathGuard,
        private readonly DescribeSchema $describeSchema,
        private readonly DescribeTables $describeTables,
        private readonly QueryDatabase $queryDatabase,
        private readonly HookRunner $hookRunner,
        private readonly BudgetTracker $budgetTracker,
        #[AiProvider] private string $provider = 'anthropic',
        #[AiModel] private string $model = 'claude-sonnet-4-6',
    ) {
    }

    public function messages(): iterable
    {
        return [];
    }

    public function tools(): iterable
    {
        // Same wrapping the built-in agents use: hooks + budget guards
        // around every call, no manual plumbing.
        return EventedTool::wrap([
            $this->describeSchema,
            $this->describeTables,
            $this->queryDatabase,
        ], $this->hookRunner, $this->budgetTracker);
    }

    public function instructions(): string
    {
        return <<<INSTRUCTIONS
        You are a read-only schema expert for the CakePHP project at: {$this->pathGuard->workspace()}

        A coding agent has delegated a database question. Answer from the live
        connection only — never guess a column, type, or relation. Quote table
        and column names exactly. You cannot edit files and no user is available:
        make judgment calls and note them in the report.
        INSTRUCTIONS;
    }
}
```

Register it as a subagent so the main agent can delegate (see below). `#[AiProvider]` and `#[AiModel]` pick up `Panifex.provider` and `Panifex.model` automatically, `#[Workspace]` scopes the guard, `#[MaxSteps(10)]` caps its loop, and `PromptableTrait` supplies the prompt loop so only `messages()`, `tools()`, and `instructions()` are yours to write.

MCP client tools, consuming external MCP servers (a browser, an external system, anything you trust) from inside an agent, attach at the agent layer the same way: the agent declares them, the harness runs them.

## Subagents

The main coding agent can delegate self-contained work to subagents: separate agents that run the task in their own fresh context with their own (usually narrower) toolset, and hand back only their final report. Exploration happens in the child; conclusions come back. Long sessions stay coherent because reading twenty files to answer "how does billing work?" no longer costs the main conversation twenty files of context.

Two subagents ship enabled:

| Name | What it does |
|---|---|
| `explorer` | Read-only codebase exploration — locates files, traces how a feature works across classes, reports back with precise file references |
| `test-writer` | Writes a Pest test file for a class or behaviour and runs it |

The agent decides when to delegate (its instructions steer it toward broad research and away from small lookups), calling the `Delegate` tool with a subagent name and a complete brief. You will see the call in the session like any other tool call.

Guarantees: shared budget (subagent token usage records into the same `BudgetTracker` as the parent session; delegation cannot exceed your spend limit, and a subagent is stopped mid-task if it exhausts it); same safety layer (subagent tools go through `PathGuard`, allowlists, hooks, and the tool events exactly like the parent's); one level deep (a subagent cannot delegate further); no user prompts (subagents never ask questions; they make judgment calls and note them in the report); fail-soft (a subagent that crashes returns an error message to the parent agent, which continues the session).

Register your own in `config/panifex.php`, including agents you have written:

```php
'subagents' => [
    'explorer' => [
        'agent' => ExplorerAgent::class,
        'description' => 'Read-only codebase exploration...',
    ],
    'schema-expert' => [
        'agent' => \App\Ai\SchemaExpertAgent::class,
        'description' => 'Answers questions about the database schema, migrations, and table relationships.',
    ],
],
```

The `description` is what the delegating model reads when deciding where to send work. Write it like a tool description. Set `subagents` to an empty array to remove the `Delegate` tool entirely.

## Hooks

Hooks are deterministic commands that run around agent activity, enforced in PHP and shell, not by the model. Use them to audit every tool call, block specific commands with your own policy, rewrite tool arguments before they run, or trigger follow-up work (formatting, notifications) after edits. Declare them in `config/panifex.php`:

```php
'hooks' => [
    'pre_tool' => [
        // Shell hook: guard every RunShell call with your own script.
        ['match' => 'RunShell', 'run' => 'scripts/panifex/guard-shell.sh'],

        // Class hook: audit every tool call.
        ['match' => '*', 'using' => \App\Hooks\AuditToolCalls::class],
    ],
    'post_tool' => [
        // Format after every file edit.
        ['match' => ['EditFile', 'WriteFile'], 'run' => 'vendor/bin/phpcs --dirty'],
    ],
    'session_start' => [],
    'session_end' => [],
],
```

Four events fire: `pre_tool` (before a tool executes, may block and may rewrite arguments), `post_tool` (after, observes only), `session_start`, and `session_end` (both observe only). Each hook takes either `run` (a shell command) or `using` (a class name), plus an optional `match` (a tool-name glob or array of globs, default `*`) and `timeout` in seconds (default 10). Hooks run in declaration order; the first block wins, and argument rewrites chain into the next hook.

Shell hooks speak a stable JSON protocol, so they can be written in any language: the event payload arrives on stdin (`post_tool` adds result and duration), exit `0` allows the call (for `pre_tool`, stdout may contain rewritten arguments), exit `2` blocks it. Stderr becomes the refusal message the agent sees, so make it instructive. Any other exit code, a timeout, or a crash is logged and ignored. A broken hook never bricks a session.

Class hooks implement the tool-hook contract (or are plain invokables): return null to allow, false to block, a string to block with that message, or an array on `pre_tool` to replace the arguments.

Notes: hooks apply everywhere tools run through the agent harness: `coder code`, `coder run`, `coder fix`, and the self-healer. They do not apply to tools served over MCP (the connected client is the policy layer there). Hooks complement the events below: reach for hooks when you want config-declared, ordered policy or non-PHP tooling; reach for listeners when you are already living in the event system. Hooks are policy on top of the safety layer, not a replacement for it. `PathGuard`, the CakePHP allowlists, and shell modes still apply first.

Panifex ships a guard pack of first-party `pre_tool` hooks: the secret-exfiltration, network-exfiltration, and composer-script guards that close known exfiltration paths. See [Safety](./safety.md#guard-pack).

## Events

Panifex dispatches CakePHP events around the agent lifecycle (`src/Event/*Event.php`, via the EventManager), so ordinary listeners can observe, or veto, what agents do:

| Event | When | Payload |
|---|---|---|
| `SessionStartedEvent` | A `coder code` / `coder run` session begins | command, provider, model |
| `SessionEndedEvent` | The session ends | command, token counts, estimated cost |
| `ToolCallingEvent` | Before a tool executes — vetoable | tool name, arguments |
| `ToolCalledEvent` | After a tool executes | tool name, arguments, result, duration |

A `ToolCallingEvent` listener that returns `false` blocks the call (the agent receives a refusal and reroutes); returning a string uses it as the refusal message. Anything else observes without interfering. Record audits, feed dashboards. Events fire for the tools of the coding agent and its subclasses and the self-healer. This is an extension layer on top of the safety guards, not a replacement. `PathGuard`, shell modes, and allowlists still apply first.

## Providers and models

Panifex is provider-agnostic through `crustum/cakephp-ai`: any provider it supports with tool calling works. Anthropic (Claude) is the default. The quickest change is via env:

```env
PANIFEX_PROVIDER=openai
PANIFEX_MODEL=gpt-4o
```

The provider name must match a key in the AI plugin config. When switching models, also set `PANIFEX_PRICE_INPUT` / `PANIFEX_PRICE_OUTPUT` to the model's per-million-token rates. The budget cap is estimated from token counts, and the defaults assume Claude Sonnet pricing. For local models set both to `0`. Switch per session with `coder code --model=... [--provider=...]` (also on `coder run`), or mid-session with the `/model` slash command, which shows a picker listing known models with their per-MTok rates.

Budget rates resolve automatically from the built-in model catalog (`src/Support/ModelCatalog.php`: Anthropic plus common OpenAI, Gemini, and Grok models). You can teach the catalog new models or correct a stale built-in rate under `Panifex.pricing.models`. Non-Anthropic built-in rates are best-effort snapshots. Verify against your provider's pricing page when the budget matters.

Internally, Panifex injects provider and model values through two custom attributes: `#[AiProvider]` and `#[AiModel]` (`src/Attribute/`), so any agent you write by extending `DefaultCodingAgent` inherits these config values automatically through the container. Agent quality tracks the model: the coding and review agents lean heavily on tool calling, so weaker models produce weaker results. The plumbing is neutral; the recommendation is Claude.

## Next steps

- [Tools](./tools.md) — the built-in toolset you are extending
- [First session](./first-session.md) — where custom agents and subagents run
- [Safety](./safety.md) — guard pack and safety underneath it all
