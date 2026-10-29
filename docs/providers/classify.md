---
description: 'Classification: typed answers with probabilities.'
---

# Classification

Classification asks a fixed set of questions about content and returns
typed answers with probabilities for routing, moderation, and scoring,
where free-form text will not do. TypeSafe is the default backend; OpenAI,
OpenRouter, and OpenAI-Compatible classify too.

> [!WARNING]
> Classification is experimental, the API may change in future minor
> releases of the plugin.

## Asking questions

Each question gets a key; the response returns each answer under its key.
`Boolean` measures true-probability, `Choice` picks one option with
per-option probabilities, `Score` positions the answer on ordered levels:

```php
use Crustum\Ai\Classification;
use Crustum\Ai\Classification\Boolean;
use Crustum\Ai\Classification\Choice;
use Crustum\Ai\Classification\Score;

$result = Classification::of('My invoice is wrong and I need help today.')
    ->questions([
        'urgent' => new Boolean('Does this request need an immediate response?'),
        'department' => new Choice('Which team should handle this request?', [
            'billing' => 'Payments, invoices, and refunds',
            'technical' => 'Bugs, outages, and integrations',
            'sales' => 'Pricing, plans, and upgrades',
        ]),
        'frustration' => new Score('How frustrated is the customer?', [
            'Calm',
            'Frustrated',
            'Very angry',
        ]),
    ])
    ->classify();
echo ($result['urgent']->isTrue() ? 'yes' : 'no') . PHP_EOL;
echo $result['department']->choice . PHP_EOL;
echo $result['frustration']->level() . PHP_EOL;
```

```text [Output]
yes
technical
1
```

`isTrue(threshold: 0.8)` gates a boolean at any cutoff (default `0.5`);
`probabilityOf('technical')` and `probabilities` expose the full
distribution; `confidence` reads the spread, `null` when unmeasurable.
`Score` adds `score` (probability-weighted), `label()`, and `normalized()`.
Iterate, count, or pull one answer with `answer('urgent')`; `usage` and
`meta->provider` ride along like everywhere else.

Single yes-or-no calls skip the ceremony: `Text::of($message)->decide('Is
this spam?')` returns a boolean, with `criteria` and `threshold` shaping
the question. Choosing one item from a list works the same way through
`Collections::of($items)->decide($question, $text, by: 'name')`. Keys win
over values when keyed, and `threshold` rejects low-confidence picks with
`null`.

## See also

- [Providers](./index.md) — capability matrix
- [TypeSafe](./typesafe.md) — the classification backend
- [OpenRouter](./openrouter.md) — regrouping classification models
