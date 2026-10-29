---
description: 'Ignis knowledge: guidelines upfront, skills on demand, project rules for your app.'
---

# Guidance

Ignis teaches agents in three different ways. They are not interchangeable:
guidelines load upfront and make every session competent, skills activate on
demand and make sessions expert, project rules capture your application's
own decisions and make the project itself the teacher. Use all three, each
for its job.

## Guidelines

Guidelines are composable instruction files with essential CakePHP and
ecosystem context: core conventions, proven methods, framework patterns.
They load upfront, so they set the baseline every session starts from.
Templates are Twig, compiled as plain text for composition. Ignis bundles
guidelines for foundation, CakePHP, PHP, Pest, PHPUnit, and MCP; the `core`
tree holds version-independent advice, major- and minor-specific trees add
deltas:

- CakePHP composes `core` plus the installed major folder; minor deltas use
  version conditions inside the major file.
- PHP composes `core` plus cumulative minor folders up to the running version.
- Packs add shared bases plus per-major trees. See Skills below.

Guidelines may wrap path-specific notes in `@scoped([...])` blocks, extracted
into managed rules under `.ai/rules/ignis`. Extraction is opt-in
(`Ignis.rules.scoped_guidelines`, default off): enabled, agents load those
rules only when editing matching paths; disabled, the content stays inline.
Keep globs tight. A broad scope for a one-off note belongs in the body, not
in a rule. Put `@scoped` blocks in guidelines, never in skills: skill writers
do not promote skill-scoped content into managed rules.

Composition follows the installed packages. CakePHP resolves `core` plus the
installed major folder; PHP resolves `core` plus cumulative minor folders up
to the running version (empty files skipped). Pack content keys the same
idea as `{pkg}/v{major}`. Foundation dependency listing respects
`Ignis.guidelines.dependencies`: `direct` (default) or `all` for transitive
packages.

Augment with your own `.twig` or `.md` files under the application's
`.ai/guidelines/` directory. They compose on install and update. Override a
bundled guideline by creating a custom file at the same path; yours wins.
Plugin authors ship package guidelines under `resources/ignis/guidelines`
(first-party targets auto-compose; other vendors are offered at install);
keep them short: what the package does, its conventions, main features.
Put code samples in `@ignissnippet` blocks.

```twig
## Package Name

This package provides [brief description].

### Features

- Feature 1: [short description].

@scoped(['src/Model/Table/**/*.php'])
- Prefer existing table methods over ad hoc queries in this package.
@endscoped
```

## Skills

Skills are targeted knowledge modules agents activate on demand. Unlike
guidelines, they cost nothing until relevant. Skills are what make Ignis
used, not just installed: the agent instructions say Ignis exists, the
skills say when to reach for which capability and in what order. Ignis
installs them from three sources: bundled (proven methods,
`infer-conventions`, MCP companions), installed plugins (each package's own
skill folders), and skill packs (`crustum/cakephp-skills`, holding shared
assets for many CakePHP and CakeDC targets, gated on the target being
installed). A real project ends up with a spread like this:

| Skill | Source |
|---|---|
| `infer-conventions` | ignis |
| `cakephp-best-practices` | cakephp |
| `broadcasting-development` | crustum-broadcasting |
| `tessera-development` | crustum-tessera |
| `migrations-development` | cakephp/migrations |
| `authorization-development` | cakephp/authorization |

A skill is a folder with a `SKILL.twig` carrying YAML frontmatter: `name`
and `description` are required, and the description is the discovery signal,
so write when-to-apply into it. Optional `references/` files hold depth.

```markdown
---
name: package-name-development
description: Build and work with PackageName features, including components and workflows.
---

# Package Name Development

## Features

- Feature 1: [clear and short description].
```

Create custom skills under `.ai/skills/{skill-name}/`; they install alongside
Ignis skills on update. Override a bundled skill with the same name. Yours
wins. Plugin authors add `resources/ignis/skills/{skill-name}/SKILL.twig` to
their package: required structure or conventions plus main-feature usage,
concise and practical, path rules left to guidelines with `@scoped`.

**Skill packs** share assets from one Composer package instead of every
plugin shipping its own tree:

```text
resources/ignis/pack/{vendor}/{package}/
  guidelines/…          # optional shared base (all majors)
  skills/…              # optional shared base
  {major}/              # e.g. 16, 4, 2 — gated by installed major
    guidelines/…
    skills/…
```

Shared bases emit first; when the installed major matches a `{major}/`
folder, that tree emits too. Skills resolve name conflicts with the major
winning, guideline keys use `{pkg}/v{major}` for versioned content.
Discovery still gates on the **target** package being installed (including
transitively). First-party targets auto-compose when installed; third-party
targets are offered at install for guidelines. For several auth/API packs the
scoped guidelines are primary and the skill stays intentionally thin.

**Guidelines vs skills:** guidelines load upfront (broad, foundational, core
conventions, path rules via `@scoped`); skills load on demand (focused,
task-specific, implementation patterns, orientation only). For several
auth/API packs the scoped guidelines are primary and the skill stays thin.

## Project rules

Rules teach agents your application: decisions, preferences, traps that no
guideline can know. A rule is anything you would otherwise explain again in
every new session. They live as Markdown files in the application's
`.ai/rules/` directory (committed, shared with the team), each declaring the
globs it applies to; Ignis keeps an `.ai/rules/index.md` mapping globs to
files, which agents consult before planning or editing so a rule loads only
when relevant.

```markdown
---
paths:
  - src/Controller/**
---

# Controllers

## Extend AppController for tenant scoping

All controllers must extend the application controller, which applies the
current tenant's query scope. Extending the framework base directly leaks
data across tenants.
```

Record rules through the agent, not by hand: ask it to remember and it
invokes the `record-rule` MCP tool with glob, title, and note. Hand-written
files stay invisible until the index regenerates (`ignis index-rules`
rebuilds it). To bootstrap rules from an existing codebase, ask the agent to
use the `infer-conventions` skill: it sweeps validation, tables and
entities, controllers, authorization, architecture, testing, templates,
database and migrations, and console, then an open-ended pass for base
classes, shared traits, and plugin layouts. It documents what the code
actually does: well-supported, non-default conventions with evidence,
framework defaults and linter-enforced style skipped, mixed
patterns reported rather than recorded. It presents each finding for
approval before writing (or records everything when told to skip
confirmation). Rules are on by default; setting `IGNIS_RULES_ENABLED=false`
removes the `record-rule` tool and stops Ignis from managing `.ai/rules`
entirely.

## Putting it together

A project lifecycle with Ignis runs the same loop at increasing depth.
Install composes guidelines for the detected stack, so the first session
already writes idiomatic code. When the work enters a domain (broadcasting,
scheduling, queue workers), the matching skill loads and the agent follows
its patterns instead of improvising. Everything the project teaches back
lands in `.ai/rules` via Record Rule or the infer-conventions sweep, so the
tenth session starts where the ninth ended rather than where the first began.
Guidelines keep every session competent, skills make sessions expert, rules
make the project itself the teacher.

Plugin authors close the loop from the other side: ship guidelines for the
package's conventions and skills for its domains, keep both concise, scope
path rules with `@scoped`, and let install/update deliver them to every
downstream project automatically.

## Where next

- [Start](./index.md) — install and quick start
- [Commands](./commands.md) — every command and option
- [MCP server](./mcp-server.md) — live application context for agents
