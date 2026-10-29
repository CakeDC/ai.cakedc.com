---
title: Panifex hosting connections
description: GitHub and GitLab, Redmine, Sentry, and the review CI pattern.
---

# Hosting connections

Everything Panifex talks to outside your machine: source hosting, issue trackers, error reporting, and the CI pattern that reviews every pull request.

## GitHub and GitLab (VCS)

One provider-agnostic abstraction (`src/Vcs/`: `VcsProviderInterface`, `VcsProviderLocator`, `Provider/GitHubProvider`, `Provider/GitLabProvider`, plus domain objects) backs every VCS-coupled surface: `CreatePullRequest`, `ReadPullRequest`, `GitDiff`, `CommitAndPush`, the worktree manager, `coder review --pr`, `coder fix --issue=N`, `coder respond`, and the healer's PR mode. The locator resolves the right provider per remote, so one process can serve several self-hosted GitLab instances: each provider owns its base host and token, and `forUrl()` routes by exact host.

```env
PANIFEX_VCS_PROVIDER=github
PANIFEX_VCS_REPO=owner/repo
GITHUB_TOKEN=ghp_...
GITHUB_REPO=owner/repo
GITLAB_TOKEN=glpat-...
GITLAB_REPO=group/project
```

Configure defaults under `Panifex.vcs` (`repo`, `provider`, per-host `github` / `gitlab` entries; `gitlab` may be a single map or a list of maps, one per host). Tokens live once per host in the shared `Panifex.credentials` block keyed by host (`github.com`, `gitlab.com`, self-hosted names), resolved through the credential store; legacy per-section keys still resolve. For a fine-grained GitHub token or app, grant repository access plus contents read, issues read, and pull-requests write, and keep the repo slug matching git origin.

When both VCS and tracker credentials are set, ask the agent naturally ("implement issue 42", "what are the open issues?"): with an issue number the tool fetches the body plus all comments as one context block; with none it lists recent open issues (pull requests filtered out). The same credentials power `coder fix --issue=N`, `coder review --pr=N`, and the `ReadPullRequest` / `CreateIssue` / `CreatePullRequest` / `CommitAndPush` tools.

Health check: `bin/cake coder health` reports which VCS remotes are configured. Verify GitLab wiring specifically with `bin/cake coder gitlab_test` (verified in `src/Command/GitLabTestCommand.php`, `coder gitlab_test`).

Issue bodies and comments are text anyone can write on a public repository, and they are fed to an agent that can edit code. Treat them as untrusted input, and consider the injection shield in [Safety](./safety.md) for issue-driven runs.

## Redmine and the unified tracker

Issues are a tracker concern, not a hosting concern. So Panifex keeps a dedicated abstraction (`src/IssueTracker/`: `IssueTrackerInterface`, `IssueTrackerLocator`, `Provider/RedmineProvider`, plus GitHub and GitLab tracker providers) with issue and comment CRUD only, while `VcsProviderInterface` keeps source-hosting (pull requests, reviews, diffs). Three tools ride it: `ReadIssue`, `CreateIssue`, `AddIssueComment` (verified in `src/Tool/`).

```env
PANIFEX_ISSUE_TRACKER_PROVIDER=redmine
PANIFEX_ISSUE_TRACKER_HOST=tracker.example.com
REDMINE_HOST=tracker.example.com
REDMINE_PROJECT=myproject
```

Configure under `Panifex.issue_tracker`: `provider` (workspace default type), `default_host`, `default_project` (used when creating an issue without an explicit project; Redmine needs one), and per-tracker sections (`redmine` may be a single map or a list of maps for several hosts; `github` carries the repo). Tokens come from the shared `credentials` block keyed by host. The GitHub issue logic is being unified into this abstraction over time; the VCS issue path still works meanwhile.

## Sentry

When `SENTRY_AUTH_TOKEN` and `SENTRY_ORG` are set, the `ReadSentryIssue` tool (`src/Tool/ReadSentryIssue.php`, read through `src/Healing/SentryReader.php`) becomes active. The agent can fetch the latest event for any Sentry issue (exception type, message, stacktrace (top frames, most recent first), breadcrumbs, and request method/URL) and use it as context when diagnosing bugs.

```env
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project
```

These are the same env vars the Sentry CLI uses, so no extra setup is needed when you already use it. Generate a token with the `issue:read` scope. When given an issue ID, the tool calls the events API for the latest event; with no ID it lists recent unresolved issues for the configured project (which is why the project slug is required for listing). The same credentials power `coder fix --sentry=ID`: a fix session seeded straight from a Sentry issue. Health check: `bin/cake coder health` reports Sentry status.

 ## MCP server

Panifex tools are not only for Panifex agents. Any MCP client (Claude Code, Cursor, Zed) can call into your app through the [MCP server](./mcp-server.md). Setup, the served tool list, and the safety rules live on that page.

## Reviewing every PR automatically

Scaffold `.github/workflows/panifex-review.yml` with `bin/cake coder install review`. Add the `ANTHROPIC_API_KEY` secret and every pull request gets a `coder review --pr --comment` pass with optional `--fail-on` gating. The generated workflow is equivalent to this hand-rolled one:

```yaml
name: Panifex Review
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivamathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-interaction --prefer-dist
      - name: Review the pull request
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
        run: |
          bin/cake coder review \
            --pr=${{ github.event.pull_request.number }} \
            --comment \
            --fail-on=critical
```

Notes: `pull-requests: write` is what lets the default `GITHUB_TOKEN` post the review. Drop `--fail-on=critical` for an advisory review. The review agent is read-only and the diff comes from the API, so the job needs no database and no `--yes`-style approval flags.

The respond flow (`coder respond`) wires the same way, gated on maintainer association so only maintainers can trigger pushes from comments:

```yaml
name: Panifex Respond
on:
  pull_request_review_comment:
    types: [created]
  issue_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write

jobs:
  respond:
    if: >
      contains(github.event.comment.body, '/tackle') &&
      contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'), github.event.comment.author_association)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivamathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-interaction --prefer-dist
      - name: Respond to the review comment
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
        run: |
          bin/cake coder respond \
            --pr=${{ github.event.issue.number }} \
            --comment-id=${{ github.event.comment.id }} \
            --comment-type=review
```

Check out the PR head ref before running so the working tree matches the pull request. Fork PRs are refused twice over (workflow gate plus the command's own refusal). The reply always arrives: success with the pushed SHA, no-op, or a clear failure. Threads never dangle.

The scheduled upgrade watch (`coder upgrade --audit --issue` on the scheduler maintains exactly one tracker issue) plus a label-triggered run closes the loop for dependencies:

```yaml
name: Panifex Upgrade
on:
  issues:
    types: [labeled]

permissions:
  contents: write
  pull-requests: write
  issues: read

concurrency: panifex-upgrade

jobs:
  upgrade:
    if: github.event.label.name == 'panifex-upgrade'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivamathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-interaction --no-scripts
      - run: |
          bin/cake coder upgrade Acme/Package \
            --headless --output=json --no-worktree \
            --ref-issue=${{ github.event.issue.number }} \
            --budget=3
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
```

The label gate matters: issue bodies are untrusted input on any repo others can open issues in, so only a maintainer action (a label they applied) hands an agent write access. `concurrency` stops two labels from racing. The checkout is already disposable, hence `--no-worktree`. Each PR carries the plan, the honest verification summary, and the issue reference; merge them and the next scheduled audit closes the issue by itself.

CI caveat shared with all agent-opened PRs: pull requests created with the workflow's default token do **not** trigger `pull_request` workflows (recursion guard). The upgrade arrives with no test run and no review attached. The in-session verification still ran, but if you want your normal PR checks too, pass a fine-grained personal token (or app token) with contents write and pull-requests write instead. See [Upgrades](./upgrade.md) and [Review](./review.md).

## Next steps

- [Chat connections](./connections-chat.md) — remote, Telegram, Slack, Rocket.Chat
- [Safety](./safety.md) — untrusted-input handling for all of the above
