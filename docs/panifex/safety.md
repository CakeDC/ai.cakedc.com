---
title: Panifex safety
description: 'Guards, database writes, guard pack, injection shield: what stops what.'
---

# Safety

Panifex's safety layer is enforced in PHP, not by prompting the model nicely:

- **Protected paths** — file tools cannot read or write `.env`, `storage/`, `vendor/`, or `.git/` by default. Enforced in `PathGuard`, not via prompting. No wording in a prompt makes `ReadFile` return your `.env`. (This guards the tools, not the whole process; see what the guards do and do not stop below.)
- **Unstaged edits** — in standard mode all file changes are left unstaged. Review with `git diff`; discard with `git checkout -- .`.
- **Worktree isolation** — in worktree mode all edits go to a temp copy of the repo. Live files are untouched until you open a PR, and the worktree is cleaned up automatically when the session ends.
- **Environment-aware defaults** — production defaults to `shell: off` and `worktree: on`. The CakePHP allowlist narrows per environment (`test` and `migrations:*` are only allowed locally). All enforced in PHP, not via prompting.
- **Allowlist-gated commands** — `RunCake` and `RunTests` check the allowlist for the current environment before executing. Commands not in the list are refused with a clear message. Destructive commands (a migration rollback) require an interactive confirmation even when allowlisted.
- **Budget cap** — the session aborts once estimated spend exceeds `budget_usd`.
- **Subprocess isolation** — `RunCake`, `RunTests`, `RunCodingStyle`, and `RunShell` all run as child processes. A broken generated file cannot crash the session.
- **Shell is gated** — the default `approve` mode requires your confirmation before any shell command runs. Use `--off` for read-only exploration.

## What the guards do and do not stop

Be clear-eyed about what these guarantees are worth, because it changes how you should deploy Panifex.

By default, the agent runs as you. Every subprocess it starts (`RunTests`, `RunCake`, an allowlisted `composer` under `RunShell`) executes with your operating-system user's full privileges. Those are separate processes that Panifex's in-PHP guards do not sit inside.

The consequence: an agent that can write code **and** trigger its execution can reach anything your user can, `PathGuard` notwithstanding. It never needs to call `ReadFile` on `.env`. It can write a Pest test that reads the env and surfaces it, then call `RunTests`; the subprocess reads the file your user can already read, and `PathGuard` is never in the path. Composer scripts are arbitrary PHP and are the same story. Worktree mode does not change this. The subprocess still runs as you and still reads the real `.env`.

This is not a bug in the implementation. It is the fundamental limit of running an agent at your own privilege level: in-process guards cannot contain in-process code execution. So:

- What the guards **do** stop: honest mistakes, casual missteps, and the accidental blast radius of a confused agent: a stray `rm`, an edit to the wrong file, a migration rollback on the wrong database. This is the overwhelming majority of what actually goes wrong day to day, and it is real protection.
- What they **do not** stop: a determined agent, or, more realistically, a **prompt-injected** one. `coder fix --sentry=`, `coder respond`, and issue-driven runs all ingest text an attacker can influence (a crafted exception message, a PR comment, an issue body). Treat that text as untrusted input that reaches an agent running as you.

How to actually bound it, in ascending order of real containment:

1. **Keep the production defaults.** In production, shell is `off` and worktree is `on`, and the CakePHP allowlist narrows to routes. The code-execution paths above are closed there. The exposure is real mainly on a developer's own machine and in staging.
2. **Run untrusted-input jobs (`coder fix`, `coder respond`, self-healing) in CI or a container with scoped, throwaway credentials**. Never with your production secrets in the environment. If the agent exfiltrates the env, there is nothing there worth taking.
3. **Isolate the process.** True containment comes from an OS-level jail (a locked-down container, a disposable VM, throwaway credentials), not from in-language checks. If you need a structural guarantee rather than a best-effort one, that is the layer that provides it.

The short version: Panifex's guards make the agent safe to work with. They do not make an agent running on your machine safe to distrust. Deploy the untrusted-input paths accordingly.

## Database writes

`QueryDatabase` is read-only, and that is not a configuration choice. Anything that is not a `SELECT` is refused in PHP.

The reason is an asymmetry worth stating plainly. Every other tool leans on the same safety net: your files are in git, so a bad edit is `git checkout`. Rows are not. A wrong `WHERE` on an `UPDATE` is a restore-from-backup.

Before enabling writes, consider not needing them. A purpose-built tool for the change you actually want (a `ResendInvoice` tool your team writes) is narrower than arbitrary SQL: you decide what can change, and the agent only decides when. It goes through the same hooks, events, and budget as every other tool.

If you do want general writes, turn on `MutateDatabase`:

```php
// config/panifex.php
'database' => [
    'mutations' => env('PANIFEX_DB_MUTATIONS', false),
    'environments' => ['local'],
    'max_rows' => env('PANIFEX_DB_MUTATION_MAX_ROWS', 100),
],
```

What it enforces, all in PHP: one statement (`UPDATE`, `INSERT`, or `DELETE` only; chained statements are refused, because a confirmed one-row update must not be able to carry a second statement; DDL is refused too, because it cannot be rolled back on every driver and so cannot be confirmed this way); a `WHERE` clause on every `UPDATE` and `DELETE`; a transaction you get to veto (the statement runs, the exact affected row count comes back from the statement itself. Nothing estimated, no SQL parsed to guess an impact, and you see that number before anything is committed; decline and it rolls back); a row ceiling (anything over `max_rows` is rolled back rather than offered for confirmation); a second lock on environment (`environments` defaults to `local`, so the flag alone cannot arm production).

With no interactive user (`coder run`, the healer, MCP), there is nobody to confirm, so the change is rolled back. `coder run --yes` approves automatically; that is a deliberate choice to make about unattended data changes.

## Guard pack

Panifex ships optional first-party hooks that block the concrete paths above. Print the recommended registration with:

```bash
bin/cake coder install guard
```

It prints `pre_tool` hook entries to add under `Panifex.hooks`: a **secret-exfiltration guard** (on file-write tools; refuses writing code that reads secrets to surface them, like reading env keys or the `.env` file directly, closing the write-a-test-that-dumps-env path); a **network-exfiltration guard** (on file-write and shell tools; flags the exfiltration transport: outbound HTTP in agent-authored code, pipe-to-shell downloads, external fetch binaries; mode `block` by default, `confirm`, or `off`); and a **composer-script guard** (on `RunShell`; blocks composer script and lifecycle invocations, since composer scripts are arbitrary PHP).

Tune each via `Panifex.guard` (`secrets`, `network`, `composer_scripts`); extend the secret patterns with `Panifex.guard.secret_patterns`.

The guard pack raises the cost of the known exfiltration paths and catches mistakes and unsophisticated injection, but it runs in-process at the agent's privilege and a determined attacker who avoids the signatures is not stopped by it. It sits below OS-level isolation, never in place of it.

## Injection shield (experimental)

The guards above defend the outbound paths: code the agent writes. The inbound threat is prompt injection through the untrusted text the agent reads: a crafted exception message, an issue body, a PR comment carrying instructions aimed at the agent. The injection shield screens the untrusted readers (`ReadSentryIssue`, `ReadIssue`, `ReadPullRequest`) with a cheap classifier model. Flagged content is returned **fenced and labelled as untrusted data the agent must not obey** — reframed, not blocked, so the reader still works. Enable it in `config/panifex.php`:

```php
'guard' => [
    'injection_classifier' => [
        'enabled' => env('PANIFEX_GUARD_INJECTION', true),
        'provider' => env('PANIFEX_GUARD_INJECTION_PROVIDER'),
        'model' => env('PANIFEX_GUARD_INJECTION_MODEL'),
    ],
],
```

It costs one cheap model call per untrusted read and **fails open**. A classifier error passes the content through unshielded rather than breaking the read. Same honest caveat, doubly so here: the classifier is itself a language model and can be injected. It lowers the odds a crafted payload steers the main agent; it does not eliminate them. Defense-in-depth, still below OS isolation.

## Next steps

- [Configuration](./configuration.md) — every guard knob
- [Hosting connections](./connections-hosting.md) — integrations and the allowlists in practice
- [Extending](./extending.md) — hooks, your own deterministic policy
