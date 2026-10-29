---
title: Panifex evals
description: 'coder eval: benchmark the agent on seeded bugs, grade fixes, track cost.'
---

# Benchmark the agent

```bash
bin/cake coder eval
```

`bin/cake coder eval` runs the coding agent against a set of seeded bugs and reports how it did. So a change to prompts, tools, or the safety layer can be **measured** instead of guessed at. It is the harness's own benchmark. Options verified in `src/Command/EvalCommand.php` (`case`, `budget`, `model`, `provider`, `agent`, `no-cache`, `json`, `keep`, `repeat`).

```bash
bin/cake coder eval                     # the built-in suite
bin/cake coder eval --case=div-by-zero  # one case (repeatable)
bin/cake coder eval --model=... --budget=0.50
bin/cake coder eval --json              # machine-readable, for CI
bin/cake coder eval --agent=lean        # benchmark a different toolset
bin/cake coder eval --no-cache          # measure caching's effect
bin/cake coder eval --repeat=3          # run every case 3 times — rates, not verdicts
bin/cake coder eval --keep              # keep each case directory to read what the agent wrote
```

Which agent is measured: by default `coder eval` benchmarks the agent `coder code` and `coder run` use, so cost and fix-rate reflect production. That agent carries the full toolset, re-sent every step, which dominates the per-case token count. Two built-in variants let you measure the levers against the same case. `--agent=lean` selects the `LeanCodingAgent` with its narrow fix-task toolset. Roughly a third cheaper on a fix case, same result. The caching coder keeps the full agent with an Anthropic `cache_control` breakpoint on the system and tool prefix. On a fix case the reported fresh input drops sharply because the fixed prefix moves to cached reads billed at a tenth. Or point `--agent` at your own `CodingAgent` class to benchmark a different toolset entirely.

## How a case is graded

Each case seeds one buggy class into an isolated directory, hands the agent a prompt, and grades the result **in a subprocess**. So a fix that leaves the file unparseable, or throws, is scored as a failure rather than taking the run down, and cases never collide in one PHP process. The machinery lives in `src/Eval/` (`EvalCase`, `EvalRunner`, `EvalReport`, `EvalResult`, `EvalGrade`, `Probe`, `CaseRepository`).

The report gives fix rate (cases where the target behaviour is now correct), false-fix rate (cases the agent "fixed" while regressing a previously-correct behaviour, tracked separately because it is the most dangerous outcome, a green-looking change that is actually wrong), not-fixed and errors, tokens and cost per case and in total (context tokens count everything the case put through the model, fresh plus cache reads plus writes, since with caching on the fresh count alone is a rounding error), and the tool-call shape of each run, printed under its row, so two agents or two models can be compared by what they did, not just what they cost.

One run is an anecdote: the same case, model, and prompt has ranged widely across three runs when the agent delegates to a subagent. Use `--repeat=3` before concluding anything. With repeats the report groups by case and prints rates and a cost range instead of a verdict. The command exits non-zero if any case regressed or errored, so it can gate a CI job.

## Nightly CI

To track the agent's fix-rate over time, scaffold a scheduled workflow:

```bash
bin/cake coder install eval-ci
```

It writes a nightly (plus manual dispatch) workflow that runs `coder eval --json` and uploads the report as an artifact. Add the `ANTHROPIC_API_KEY` secret. Each run calls the model for every case, so it costs tokens on every run. Tune it like you own it: run it less often (weekly, or manual dispatch only), use a cheaper model (`--model` with a Haiku-class id), scope the suite (`--case=...` for a representative subset). The job fails the check on any regression or error, so a red run means the agent got worse.

The built-in suite ships a set of cases across categories (division-by-zero, off-by-one, percentage math, tax rounding, nullable relations, cross-file bugs, empty-array boundaries, slugs, missing enum cases, recursion base cases). Enough to catch a regression in a change to the agent. Add your own for your domain.

## Adding your own cases

Scaffold one with the generator, then fill it in:

```bash
bin/cake coder eval "refund rounding"   # writes evals/refund-rounding.php
```

`coder eval NAME` **generates** a case; `coder eval` **runs** them. Under the hood a case is just a file: drop `*.php` files in your project's `evals/` directory (configurable via `Panifex.evals.path`). Each file returns an `EvalCase`, or an array of them, and is merged into the suite; a case whose `id` matches a built-in overrides it. Set `Panifex.evals.include_builtin` to `false` to run only your own.

```php
// evals/refund-rounding.php
use Crustum\Panifex\Eval\EvalCase;
use Crustum\Panifex\Eval\Probe;

return new EvalCase(
    id: 'refund-rounding',
    title: 'Refund is rounded down, losing a cent',
    category: 'bug',
    files: [
        'Refund.php' => <<<'PHP'
        <?php

        class Refund
        {
            public function cents(float $dollars): int
            {
                return (int) ($dollars * 100);
            }
        }
        PHP,
    ],
    prompt: 'Refund::cents() truncates instead of '
        . 'rounding — 19.99 becomes 1998 cents. '
        . 'Fix it to round to the nearest cent.',
    // Probe runs in a subprocess: set $target (bug
    // fixed) and $happy (old behaviour still holds).
    grader: Probe::subprocess('Refund.php', '
        $r = new Refund();
        $target = $r->cents(19.99) === 1999;
        $happy  = $r->cents(10.00) === 1000;
    '),
);
```

Keep each case small, pure, and unambiguous: one class, one clear bug, and a grader that checks both the fix and that the happy path still holds, so grading stays deterministic and cheap. Graders run in a subprocess, so a fix that leaves the file unparseable scores as a failure rather than crashing the run. The built-in cases live in `CaseRepository` if you want examples to copy.

Why it matters: every other improvement to the harness was worth building, but without a benchmark you cannot tell whether the next change helped or hurt. `coder eval` turns "did that help?" into a number.

## Next steps

- [Headless runs](./sessions-run.md) — JSON and exit-code conventions shared with eval
- [Tools](./tools.md) — the toolset behind the tool-call shapes
- [Reference](./reference.md) — the install eval-ci scaffold
