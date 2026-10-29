---
description: 'Approvals: human gates on sensitive tool calls, pause and resume.'
---

# Approvals

This is the human-in-the-loop (HITL) flow. Gate irreversible tools: the run
pauses for your decision and resumes with it. Implement
`Crustum\Ai\Contracts\Approvable` with `InteractsWithApprovalsTrait`.
Tools are approvable by default; override `needsApproval()` to decide per arguments
(return `false`, `true`, or an `Approval` with a reason).

When the model calls an approvable tool, the run pauses *before* running
it. Check `$response->pendingApprovals` (tool call id, tool name,
arguments, reason), collect decisions, then resume with
`continue($conversationId, $user)->prompt($decisions)`. The agent has to carry
conversation state, so this example uses `RemembersConversationsTrait` to keep
the paused turn resumable:

::: code-group

```php [WipeCache.php]
use Crustum\Ai\Approvals\Approval;
use Crustum\Ai\Contracts\Approvable;
use Crustum\Ai\Contracts\Tool;
use Crustum\Ai\Tools\Request;
use Crustum\Ai\Trait\InteractsWithApprovalsTrait;
use Crustum\JsonSchema\Contracts\JsonSchema;

class WipeCache implements Approvable, Tool
{
    use InteractsWithApprovalsTrait;

    public function description(): string
    {
        return 'Wipe the application cache.';
    }

    public function handle(Request $request): string
    {
        return 'WIPED';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'scope' => $schema->string(),
        ];
    }

    protected function needsApproval(Request $request): Approval|bool
    {
        return $request['scope'] === 'all'
            ? Approval::required('A full cache wipe needs a human.')
            : false;
    }
}
```

```php [CacheAgent.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\Conversational;
use Crustum\Ai\Contracts\HasTools;
use Crustum\Ai\Trait\PromptableTrait;
use Crustum\Ai\Trait\RemembersConversationsTrait;

class CacheAgent implements Agent, Conversational, HasTools
{
    use PromptableTrait;
    use RemembersConversationsTrait;

    public function instructions(): string
    {
        return 'You are a cache janitor.';
    }

    public function tools(): iterable
    {
        return [new WipeCache()];
    }
}
```

```php [run.php]
use Crustum\Ai\Approvals\Decision;
use Crustum\Ai\Approvals\Decisions;

$user = new class {
    public int $id = 7;
};

$paused = (new CacheAgent())->forUser($user)->prompt('Wipe the cache.');
echo $paused->hasPendingApprovals() ? "paused\n" : "ran\n";

foreach ($paused->pendingApprovals as $approval) {
    echo $approval->tool . "\n";
}

$decisions = Decisions::from([
    $paused->pendingApprovals->first()->id => Decision::approve(),
]);
$done = (new CacheAgent())->continue($paused->conversationId, $user)->prompt($decisions);
echo $done->text . PHP_EOL;
```

:::

```text [Output]
paused
WipeCache
Cache wiped.
```

Every pending call needs a decision: `Decision::approve()`,
`Decision::edit([...])` to approve with corrected arguments,
`Decision::reject('reason')`, or plain `true`/`false` shorthand.
`Decision::approveAll()` / `rejectAll()` and `approveRemaining()` /
`rejectRemaining()` cover the rest; unknown or missing ids throw
`ApprovalMismatchException`.

While a turn is paused, don't start new prompts. Resume with decisions.
Matching is by conversation and pending calls, not by participant, so authorize
the conversation first and resume on purpose.
Approvals are single-use: once the tool ran, continue a later failure with a
plain text prompt instead of replaying the same decisions.

## Rejecting a call

Reject with a result and the model adapts to it. Reject empty and the loop
records it and stops:

::: code-group

```php [reject.php]
use Crustum\Ai\Approvals\Decision;
use Crustum\Ai\Approvals\Decisions;

$user = new class {
    public int $id = 7;
};

$paused = (new CacheAgent())->forUser($user)->prompt('Wipe the cache.');
echo $paused->hasPendingApprovals() ? "paused\n" : "ran\n";

$decisions = Decisions::from([
    $paused->pendingApprovals->first()->id => Decision::reject('Keep the cache.'),
]);
$done = (new CacheAgent())->continue($paused->conversationId, $user)->prompt($decisions);
echo $done->hasPendingApprovals() ? "paused\n" : "done\n";
echo $done->text . PHP_EOL;
```

:::

```text [Output]
paused
done
Cache kept.
```

Override at the call site when you need an exception: `(new WipeCache)->withoutApproval()`
skips the gate for that agent, `(new WipeCache)->requireApproval('...')` forces it.

## Serving the flow from a controller

Serve both halves from one endpoint. Send `message` to start or continue the
run, send `decisions` to answer a pause. Authorize the conversation first.
Matching is by conversation and pending calls, not by participant:

```php
use App\Ai\Agents\CacheAgent;
use Crustum\Ai\Approvals\Decision;
use Crustum\Ai\Approvals\Decisions;

class ChatController extends AppController
{
    public function submit(string $conversationId): Response
    {
        $conversation = $this->Conversations->get($conversationId);
        $this->Authorization->authorize($conversation, 'view');

        $data = $this->request->getData();

        $prompt = isset($data['decisions'])
            ? Decisions::from(collection($data['decisions'])->map(
                fn (array $decision) => match ($decision['action']) {
                    'approve' => Decision::approve(),
                    'reject' => Decision::reject($decision['result'] ?? null),
                }
            )->toList())
            : $data['message'];

        $response = (new CacheAgent())
            ->continue($conversation->id, as: $this->request->getAttribute('identity'))
            ->prompt($prompt);

        return $this->response
            ->withType('application/json')
            ->withStringBody((string)json_encode([
                'conversation_id' => $response->conversationId,
                'status' => $response->hasPendingApprovals() ? 'awaiting_approval' : 'complete',
                'message' => $response->text,
                'approvals' => $response->pendingApprovals,
            ]));
    }
}
```

On `awaiting_approval`, the chat screen renders each pending call with its tool, arguments
and reason, then posts choices back by tool call id. Otherwise it posts a plain
`message`:

```json
{
    "decisions": {
        "call_abc": {
            "action": "approve"
        },
        "call_def": {
            "action": "reject",
            "result": "The cache must be retained."
        }
    }
}
```

## Where next

- [Tools](./tools.md) — writing tools
- [Memory](./memory.md) — persisted conversations
- [Streaming](./streaming.md) — approval events mid-stream
