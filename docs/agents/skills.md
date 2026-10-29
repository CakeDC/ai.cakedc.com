---
description: 'Skills: on-demand instructions from SKILL.md libraries, loaded when needed.'
---

# Skills

Skills keep specialized instructions out of the system prompt. The model
first sees each skill's name and description; when one matches the task, it
loads that skill's instructions (and any bundled files) through a tool. Any
agent with domain procedures (refunds, support tone, escalation rules) can
use them, not just coding agents.

A skill is a directory with a `SKILL.md` file: frontmatter (`name`,
`description`) plus a Markdown body. Sibling files ride along as bundled
resources the model can ask for by path:

```text
skills/
  refund-policy/
    SKILL.md
    exceptions.md
```

```markdown
---
name: refund-policy
description: Refund eligibility rules and the next step for the customer.
---

Ask for the order number first. Orders within 30 days are refundable;
digital goods are not. Escalate amounts over 500 to a human.
```

An agent exposes skills with `Crustum\Ai\Contracts\HasSkills::skills()`:
skill objects, library directories, or closures returning either. The
`LoadSkill` tool is merged into the agent's tools automatically (or into a
declared one); without skills it adds nothing:

::: code-group

```php [SupportAgent.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\HasSkills;
use Crustum\Ai\Trait\PromptableTrait;

class SupportAgent implements Agent, HasSkills
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You help customers. Load the refund-policy skill for refund questions.';
    }

    public function skills(): iterable
    {
        return [ROOT . DIRECTORY_SEPARATOR . 'skills'];
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

The model called the loader with `{"name": "refund-policy"}`, read the
instructions, and answered from them. A `path` argument reads one bundled
file instead (path traversal guarded, 256KB inline cap, binary refused).
A `LoadSkill` built with no sources falls back to `resources/skills`; the
earliest source wins when two libraries define the same name.

## Skill vs tool vs sub-agent

- **Skill** — the model needs instructions plus bundled files it reads
  selectively (procedures, policies, checklists). No PHP runs.
- **Tool** — the agent must execute real PHP or call an outside system
  (database, API, files) and feed the result back into the run.
- **Sub-agent** — the task needs its own instructions, tools, and step
  budget delegated as one unit (see [Sub-agents](./sub-agents.md)).

## Where next

- [Tools](./tools.md) — writing tools
- [Agents](./index.md) — lifecycle and prompting
- [Sub-agents](./sub-agents.md) — delegation via `AgentTool`
