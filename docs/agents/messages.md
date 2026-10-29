---
description: 'Messages in CakePHP AI: roles, ad-hoc history, and what the model sees.'
---

# Messages

The unified input for every agent call is a list of `Crustum\Ai\Messages\Message`
objects (`role` + `content`). Roles are plain strings (`user`, `assistant`,
…); the provider layer translates them to each API's native format, so your
code never branches per provider.

Two ways to feed history:

- **Ad-hoc** — pass `Message` objects to the agent for a single run (for example, a
  history posted by your frontend).
- **Loaded** — the agent implements `Conversational` and returns history from
  `messages()` itself. On a plain (non-conversational) agent you can also use
  `withMessages([...])`; combining it with a conversational agent throws a
  `LogicException`.

`AnonymousAgent` is conversational, so history travels in its constructor,
the second argument:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Messages\Message;

$history = [
    new Message('user', 'Analyze this transcript.'),
    new Message('assistant', 'The rep never asked for the close.'),
];

$response = (new AnonymousAgent('You are a probe.', $history, []))->prompt('What should they say next time?');

echo $response->text . PHP_EOL;
echo count($history) . " history messages sent\n";
```

```text [Output]
The close was never asked for.
2 history messages sent
```

## Sharing messages between agents

A turn's messages are plain objects. Hand a previous response's messages to
another agent to continue its context with a specialist:

```php
use Crustum\Ai\AnonymousAgent;

$first = (new AnonymousAgent('You are a probe.', [], []))->prompt('Remember: blue.');
echo $first->text . PHP_EOL;

$second = (new AnonymousAgent('You are a specialist.', $first->messages, []))
    ->prompt('What was remembered?');
echo $second->text . PHP_EOL;
```

```text [Output]
Stored: blue.
Recalled: blue.
```

Multimodal content (images, audio, files) travels as message attachments.
See [RAG](../rag/index.md) and the capability pages.

## Attachments

Prompts accept files alongside text: documents for analysis, images for
vision, audio for transcription. Build them with `Crustum\Ai\Files\Document`,
`Image`, `Audio`, `Video`: `fromPath()` for local files, `fromStorage()`
for a filesystem disk, `fromUpload()` for HTTP uploads:

```php
use Crustum\Ai\AnonymousAgent;
use Crustum\Ai\Files;

$response = (new AnonymousAgent('You are a probe.', [], []))->prompt(
    'Summarize the attached transcript.',
    attachments: [
        Files\Document::fromPath('/var/www/transcript.md'),
    ],
);

echo $response->text . PHP_EOL;
```

```text [Output]
Transcript summarized.
```

The provider layer translates each attachment to the API's native format.
Your code never branches per provider. Check the model's capabilities
before sending images, audio, or video; not every model reads every type.

## Where next

- [Memory](./memory.md) — persisting conversations across prompts
- [Structured output](./structured-output.md) — typed responses
- [Streaming](./streaming.md) — token-by-token delivery
