---
description: 'Sub-agents: delegating tasks to specialized agents via AgentTool.'
---

# Sub-agents

An agent listed in another agent's `tools()` becomes a sub-agent: the parent
delegates a self-contained task, the child runs in isolation (no parent
history), and its answer feeds back into the parent's loop. Use this when a
generalist needs specialists with their own instructions, tools, or models.

Without `CanActAsTool`, the tool name is the class basename and the
description asks the parent for a clear task. Implement
`Crustum\Ai\Contracts\CanActAsTool` (`name()`, `description()`) for a
tool-facing name like `refunds_specialist`.

::: code-group

```php [RefundsAgent.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\CanActAsTool;
use Crustum\Ai\Trait\PromptableTrait;

class RefundsAgent implements Agent, CanActAsTool
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You decide refund eligibility. Answer briefly.';
    }

    public function name(): string
    {
        return 'refunds_specialist';
    }

    public function description(): string
    {
        return 'Determine whether an order is eligible for a refund and explain the next step.';
    }
}
```

```php [SupportAgent.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasTools;
use Crustum\Ai\Trait\PromptableTrait;

class SupportAgent implements Agent, HasTools
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You help customers. Delegate refund questions to the refunds specialist.';
    }

    public function tools(): iterable
    {
        return [new RefundsAgent()];
    }
}
```

```php [run.php]
$response = (new SupportAgent())->prompt('Is order 42 refundable?');
echo $response->text . PHP_EOL;
```

:::

```text [Output]
Yes, order 42 is refundable.
```

When the parent streams, sub-agents stream too: preliminary `ToolResult`
events carry the child's text so far, followed by the final result. The
completed response folds the sub-agent in: text, reasoning, citations and
usage all include the child's contribution.

## Where next

- [Tools](./tools.md) — writing tools
- [Agents](./index.md) — lifecycle and prompting
- [Middleware](./middleware.md) — hooking the run
