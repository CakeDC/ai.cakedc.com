---
description: 'Conversation memory: ad-hoc history per run or database persistence across prompts.'
---

# Memory

Multi-turn agents need context. Two mechanisms, pick one per agent (combining
both throws a `LogicException`):

1. **Ad-hoc history** — pass `Message` objects per run. No storage, no setup.
2. **Database persistence** — `RemembersConversationsTrait`: conversations and
   messages are stored automatically; resume with `continue($id)` or
   `continueLastConversation($user)`. Requires the Ai plugin migration
   (`agent_conversations`, `agent_conversation_messages`).

## Ad-hoc turns (no database)

Each prompt gets a fresh agent carrying the history accumulated so far:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Messages\Message;

$first = (new AnonymousAgent('You are a probe.', [
    new Message('user', 'Remember: blue.'),
], []))->prompt('What word?');
echo $first->text . PHP_EOL;

$second = (new AnonymousAgent('You are a probe.', [
    new Message('user', 'Remember: blue.'),
    new Message('assistant', $first->text),
    new Message('user', 'Repeat it back.'),
], []))->prompt('Repeat it back.');
echo $second->text . PHP_EOL;
```

```text [Output]
Say "blue".
The word was "blue".
```

## Persisted conversations (real database)

A dedicated agent class using the real trait. The trait implements
`messages()` from the store, so the class only declares instructions:

::: code-group

```php [SupportCoach.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\Conversational;
use Crustum\Ai\Trait\PromptableTrait;
use Crustum\Ai\Trait\RemembersConversationsTrait;

class SupportCoach implements Agent, Conversational
{
    use PromptableTrait;
    use RemembersConversationsTrait;

    public function instructions(): string
    {
        return 'You are a support coach. Keep replies short.';
    }
}
```

```php [run.php]
$user = new class {
    public int $id = 7;
};

$first = (new SupportCoach())->forUser($user)->prompt('Remember: blue.');
echo $first->text . PHP_EOL;
echo $first->conversationId === null ? "no-id\n" : "has-id\n";

$second = (new SupportCoach())->continue($first->conversationId, $user)->prompt('What did I say?');
echo $second->text . PHP_EOL;
```

:::

```text [Output]
Stored: blue.
has-id
Recalled: blue.
```

`forUser()` starts a fresh conversation for any object with an `id`
(participant type = class, key = id). `conversationId` on the response is the
handle to store; `continue()` / `continueOrStart()` / `continueLastConversation()`
resume it. Do not define `messages()` manually on a trait-using agent. The
trait's implementation (loading from the store) would be shadowed.

## Resuming the last conversation

When the caller has no stored handle, resume by participant instead of by
id. The store finds the participant's latest conversation with this agent:

```php
$user = new class {
    public int $id = 7;
};

$first = (new SupportCoach())->forUser($user)->prompt('Remember: blue.');
echo $first->text . PHP_EOL;

$second = (new SupportCoach())->continueLastConversation($user)->prompt('What did I say?');
echo $second->text . PHP_EOL;
```

```text [Output]
Stored: blue.
Recalled: blue.
```

## Owning history yourself

When the history lives in your own tables, implement `Conversational` and
load it in `messages()`. The trait does exactly this against the plugin
tables. This is the same hook with your own storage behind it:

::: code-group

```php [HistoryCoach.php]
use Crustum\Ai\Contracts\Agent;
use Crustum\Ai\Contracts\Conversational;
use Crustum\Ai\Messages\Message;
use Crustum\Ai\Trait\PromptableTrait;

class HistoryCoach implements Agent, Conversational
{
    use PromptableTrait;

    public function instructions(): string
    {
        return 'You are a support coach. Keep replies short.';
    }

    public function messages(): iterable
    {
        return [
            new Message('user', 'Remember: blue.'),
        ];
    }
}
```

```php [run.php]
$response = (new HistoryCoach())->prompt('What did I say?');
echo $response->text . PHP_EOL;
```

:::

```text [Output]
Recalled: blue.
```

Pick one history source: `messages()` on the class, `withMessages()` per
run, or the trait's stored conversations. A manual `messages()` on a
trait-using agent shadows the trait, and `withMessages()` on a
`Conversational` agent throws a `LogicException`.

## Stores and titles

Persistence goes through `Crustum\Ai\Contracts\ConversationStore`. The
default `DatabaseConversationStore` uses the `Ai.conversations` connection
and tables (`agent_conversations`, `agent_conversation_messages`, set in
`config/ai.php`). Swap it with `Ai::manager()->setConversationStore($store)`
or a container binding. The trait never touches SQL itself.

Each conversation gets a title: by default the provider drafts a short one
from the first prompt (`Ai.conversations.generate_title`, cheapest model),
falling back to truncated prompt text.

## Participants other than users

Users are the common case, but conversations belong to any CakePHP ORM
entity. `forParticipant()` starts a conversation for another model type;
`forUser()` is its alias:

```php
$team = new class {
    public int $id = 3;
};

$first = (new SupportCoach())->forParticipant($team)->prompt('Remember: blue.');
echo $first->text . PHP_EOL;

$second = (new SupportCoach())->continue($first->conversationId, $team)->prompt('What did I say?');
echo $second->text . PHP_EOL;
```

```text [Output]
Stored: blue.
Recalled: blue.
```

The participant's morph class and primary key are stored with the
conversation, so `User` id `1` and `Team` id `1` keep separate histories.
`continueLastConversation($team)` resumes the participant's latest
conversation with that agent. `continue()` and `continueOrStart()` never
verify that the participant owns the conversation. Authorize access first.

## Inspecting stored conversations

Resolve the store to read messages back without touching the plugin's
tables. Messages page newest-first; each `StoredMessage` carries its id,
role, content, timestamps, usage, status, and attachments:

```php
use Crustum\Ai\Ai;

$user = new class {
    public int $id = 7;
};

$first = (new SupportCoach())->forUser($user)->prompt('Remember: blue.');
$second = (new SupportCoach())->continue($first->conversationId, $user)->prompt('What did I say?');

$store = Ai::manager()->conversationStore();
$page = $store->paginateConversationMessages($second->conversationId, perPage: 25);

$roles = [];
foreach ($page->items() as $message) {
    $roles[] = $message->role;
}
echo implode(',', $roles) . PHP_EOL;
echo count($page->items()) . " messages\n";
```

```text [Output]
assistant,user,assistant,user
4 messages
```

Each turn stores one user message and one assistant message, so two turns
read back as four rows. A turn is a list of steps (one provider request
each), and `toolCalls()`, `providerToolCalls()`, and `toolResults()`
flatten them in order. A tool call with an approval reason but no result is
still awaiting a decision; after a page reload, render those with
`pendingApprovalsFor($conversationId)` instead of resuming. Before
continuing from a frontend-supplied id, confirm ownership with
`conversationBelongsTo($conversationId, $type, $id)`.

## Where next

- [Agents](./index.md) — lifecycle and prompting
- [Structured output](./structured-output.md) — typed responses
- [Testing](./testing.md) — asserting remembered conversations with `AiFlow`
