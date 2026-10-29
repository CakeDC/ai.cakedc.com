---
title: Panifex chat connections
description: 'Drive the agent from browser, Telegram, Slack, Rocket.Chat: setup, pairing, security.'
---

# Chat connections

Four ways to drive the same agent without a terminal: the browser remote UI, Telegram, Slack, and Rocket.Chat. All four are outbound-only in the direction that matters, all reuse the same harness (same agent, same tools, same safety layer, same persistent sessions), and all treat their allowlist as the whole security model. Options verified in `src/Command/RemoteCommand.php`, `TelegramCommand.php`, `SlackCommand.php`, and `RocketChatCommand.php`.

## Remote (browser and phone)

A browser UI for Panifex: drive your in-app AI coding agent from any device, including your phone:

```bash
bin/cake coder remote --host=0.0.0.0
```

Run it, scan the QR code printed in your terminal, and your phone is now a remote control for the agent running inside your CakePHP app: send it tasks (including photos straight from your camera), watch it work tool-by-tool, and answer its approval prompts from a bottom sheet ("Panifex wants to run `bin/cake migrations migrate` — Deny / Allow once / Always allow").

It is the same harness as `coder code`: same agent, same tools, same safety layer (protected paths, allowlists, budget, hooks, subagents), same persistent sessions. Only the terminal is replaced by a web page.

The command accepts `--host` (default `0.0.0.0`), `--advertise-host` (the address placed in pairing URLs when auto-detection picks the wrong adapter, such as Docker bridges or VPN tunnels), `--port` (default `8787`), `--public-url` (external URL placed in pairing QR codes when a reverse proxy fronts the private bind address; when set, the terminal prints a browser preview link served as SVG by the router instead of a terminal QR), `--session`, and `--agent`. Two addresses are kept separate on purpose: the bind interface the HTTP server listens on, and the advertised host clients actually dial.

Pairing links are single-use: the first device to open one is paired and receives a signed session cookie; the link then expires and the terminal prints a fresh QR for the next device. Sessions, and everything they are signed with, die with the process.

How it works: `coder remote` is two processes sharing a state directory. The command process is the agent: it waits for messages in an inbox, runs each as an agent turn exactly like `coder code` does, and appends every event (text, tool calls, budget) to an append-only log. A framework-free HTTP server serves a single-file mobile UI and small JSON endpoints; requests are file reads measured in microseconds, and the UI polls at hundreds of milliseconds, which is indistinguishable from streaming for a chat interface.

Approval prompts flow through the interaction-policy contract: the remote interaction publishes the question to the state directory and waits for the browser's tap. "Always allow" writes through to the permission store, exactly like answering in the terminal. Unanswered questions time out to a denial (never an approval) after `answer_timeout` seconds (default 600).

Auth is handled by an access guard: single-use pairing codes, HMAC-signed session cookies, failure lockout. Slash commands and file mentions work: typing `/` offers the same commands the terminal has (`/clear`, `/compact`, `/help`, plus your project's `.panifex/commands/*.md` templates, expanded server-side with identical argument semantics); typing `@` offers workspace files from a git-aware index (gitignored files never appear), refreshed after each turn; an attached image reaches the model as vision input, exactly as in the terminal. Photos from the camera button are downscaled on-device, validated server-side (type whitelist, size cap), and pruned on clear like terminal attachments. Because state is files, the UI survives page reloads, multiple devices can watch the same session, and there is no websocket infrastructure to run.

Security: this endpoint edits files and runs commands on the machine it serves, so treat it with SSH-grade caution: single-use pairing (a copied or replayed link gets nothing; only a hash of the code ever touches disk); signed sessions (paired devices hold an HMAC-signed, `HttpOnly`, `SameSite=Strict` cookie with a 12-hour sliding expiry; the signing secret lives only in process memory and the server child's environment, never on disk, so every session dies with the process); failure lockout (repeated bad attempts from an address get a temporary lockout; valid cookies are exempt, so an attacker spamming codes cannot lock out your paired phone); timeouts deny (an unanswered approval question is denied, never approved); local by default (binds all interfaces only when you pass `--host=0.0.0.0`; restrict to loopback to keep it on one machine). All of the core guarantees still apply underneath: `PathGuard`, CakePHP and shell allowlists, budget enforcement, hooks.

For persistent team access over the public internet, do not expose the QR server directly: put the server and your phone on the same private network (a WireGuard mesh works), or terminate TLS at a real proxy (Caddy, nginx) with an identity layer in front (VPN at minimum). Plain HTTP on a public interface means cookies and pairing codes travel in cleartext. Never do that. `bin/cake coder health` verifies the remote wiring; `PANIFEX_REMOTE_DEBUG` traces the pump.

## Telegram

Drive a Panifex coding session from Telegram. Send a task, watch it work, tap Yes when it asks before doing something destructive. Outbound-only `getUpdates` is a long poll your machine opens to Telegram, so a laptop behind NAT with no public URL, no tunnel, and no hosted process can be driven from anywhere in the world. Options verified: `--session`, `--chat`, `--if-configured`, `--pair`.

Get a token from BotFather:

```env
PANIFEX_TELEGRAM_TOKEN=123456:ABC...
```

Then find out which chat is allowed to drive it. Open your bot in Telegram, send it anything, and run:

```bash
bin/cake coder telegram --pair
```

Say yes and it writes the chat id into `.env` (`PANIFEX_TELEGRAM_CHATS`), appending rather than replacing so pairing a second device does not revoke the first. Then it exits, because pairing is a setup step rather than a session. A chat that is already allowed skips the question and says so. It asks, and defaults to no, because this is the allowlist, the whole security model, and the id on screen might belong to whoever else found your bot. A human confirming they recognise the name is the check. `--pair` itself acts on nothing it hears, so anyone can make it print their id and none of them can make it do anything. Stop any running session first: Telegram delivers each update exactly once, to whoever asks for it first, so a session polling alongside `--pair` will take turns swallowing your messages.

Then start a session. It stays in the foreground, like `coder code`:

```bash
bin/cake coder telegram
bin/cake coder telegram --session=billing   # a separate conversation
bin/cake coder telegram --chat=987654321    # which allowed chat to talk to
```

Security: a bot token is far more discoverable than a pairing code shown in your terminal, and anyone who can message this bot can run code on the machine hosting it. An unlisted chat is not answered, not rate-limited, not asked to authenticate. Its message is dropped before it can reach the agent. An empty allowlist means nobody, and the command refuses to start rather than quietly accepting everyone. The agent echoes file contents, stack traces, and whatever else it reads into the chat: for your own projects that is a choice you can make; for a client's, or anything with a compliance boundary, it may simply be a no.

What it is like to use: one message per turn, edited as it grows: prose and tool calls together, the way the terminal renders it, not six notifications. Silent by default. The only thing that buzzes your phone is a question the agent is blocked on. Approvals as inline buttons: a tap answers only the question currently open. Markdown rendered, not printed as asterisks.

Commands: `/start` (what this is and how to use it), `/help` (built-in and project commands), `/clear` (forget the conversation and start fresh); anything else is a task for the agent. Restarting the command resumes the conversation rather than resetting it. `/clear`, or a new `--session`, is what starting over actually looks like. Voice notes and photos are not supported yet; the bot says so rather than ignoring them.

Nothing about the agent changes: the transport is a pump between the shared state directory (inbox, events, questions, answers as files) and a chat. Every `ConfirmAction`, every destructive `RunCake`, every `MutateDatabase` commit routes to Telegram automatically, because they already routed through the interaction policy.

Troubleshooting: nothing arrives. Set `PANIFEX_TELEGRAM_DEBUG=1` to trace what the pump is doing. A group chat ignores you. Bots have privacy mode on by default and only see messages that start with `/` or reply to the bot; turn it off, or use a direct chat. `getUpdates` fails outright. A webhook set on the bot disables polling; remove it with `deleteWebhook`.

`--if-configured` idles instead of exiting when there is no token, for dev scripts where the bot is optional. Run on its own without a token it still fails loudly, because then you meant to start it.

## Slack

Drive a Panifex coding session from Slack where a team already is. A session in a channel is one the whole team can watch, and one where the approval a destructive step needs can come from whoever is around, as long as they are on the list. It stays outbound-only through Socket Mode: a WebSocket your machine opens to Slack. No public URL, no tunnel, no hosted process. Options verified: `--session`, `--channel`, `--if-configured`, `--pair`.

Setup: create the app from a manifest (bot user, a `/tackle`-style slash command for Panifex, bot scopes for chat, channels, IM, and users, event subscriptions for messages, interactivity enabled, Socket Mode enabled). Then two tokens from two different pages: the Bot User OAuth Token into `PANIFEX_SLACK_BOT_TOKEN`, and an app-level token with the connections scope into `PANIFEX_SLACK_APP_TOKEN`. Invite the app to the channel you want to use, or open a direct message with it.

Pairing works like Telegram's: send the app a message, run `bin/cake coder slack --pair`, confirm the printed user and channel ids go into env (`PANIFEX_SLACK_USERS`, `PANIFEX_SLACK_CHANNEL`: appending users, setting the channel only when unset). Pairing acts on nothing and defaults to no, for the same allowlist reasons. Stop any running session first: Slack spreads events across every open Socket Mode connection, and a session running alongside `--pair` will take turns swallowing messages.

```bash
bin/cake coder slack
bin/cake coder slack --session=billing        # a separate conversation
bin/cake coder slack --channel=D0123456789    # talk somewhere else this time
```

Leave the channel unset and the session opens a direct message with the first allowed user.

Security: the allowlist is the whole security model. Anyone who can message this app can run code on the machine hosting it, and in a channel that is everyone in the channel. An unlisted user is dropped before reaching the agent; an empty allowlist refuses to start. The agent echoes file contents and stack traces: in a direct message that stays between you and Slack; in a channel it goes to everyone who can read the channel, which is worth deciding on purpose.

What it is like to use: one message per turn, edited as it grows. Quiet by default. Slack only notifies about a channel message when it names you, so a question names whoever last spoke to the agent; progress is for glancing at. Approvals as buttons, replaced with the decision and who made it, so the channel keeps a record rather than a live control someone else could press. Slack's own message dialect for rendering.

Slack intercepts anything beginning with `/`, so `/clear` on its own never reaches the agent. The registered slash command (same name as the upstream `/tackle`) carries it: `/tackle` (what this is), `/tackle help`, `/tackle clear`, `/tackle NAME` for project commands, anything else after it is a task; anything not starting with `/` is a task too. Files and images are not supported yet; the bot says so rather than ignoring them. Restarting resumes the conversation; `/tackle clear` or a new `--session` starts over.

Troubleshooting: nothing arrives. `PANIFEX_SLACK_DEBUG=1` traces reads, posts, edits, and reconnects. The app posts but never answers. Almost always the allowlist; compare `--pair` output with `PANIFEX_SLACK_USERS`. `not_in_channel`: invite the app first. `channel_not_found`: the channel config wants the id, not the name. Slash command dispatch failures mean the session is not running.

## Rocket.Chat

The same idea for Rocket.Chat teams: outbound-only DDP plus REST, no public URL, no tunnel. Options verified: `--session`, `--room`, `--if-configured`, `--pair`.

```bash
bin/cake coder rocketchat --pair    # find the user id and write it to env
bin/cake coder rocketchat
bin/cake coder rocketchat --session=billing
```

Configure `server_url`, `user_id`, `auth_token`, `room`, and `allowed_users` (`PANIFEX_ROCKETCHAT_*`). The allowlist is the whole security model here too. An unlisted user is dropped before reaching the agent, an empty list refuses to start. `edit_interval` throttles turn-message edits; `debug` traces the pump.

## Next steps

- [Hosting connections](./connections-hosting.md) — hosting integrations, and the [MCP server](./mcp-server.md)
- [Safety](./safety.md) — the allowlist model and what it does not cover
- [First session](./first-session.md) — the interactive session these transports drive
