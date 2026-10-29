---
title: Demo
description: 'AiDemo: runnable example application for the ecosystem.'
---

# Demo: AiDemo

AiDemo is a CakePHP skeleton application with `crustum/cakephp-ai` installed. It is the runnable example for the whole ecosystem. Every behavior below exists in its source.

## The Assistant agent

`src/Agents/Assistant.php` is a conversational, tool-using agent with short-reply instructions. It exposes four tools and wraps the email sender in an approval gate.

## Four tools

- **CurrentLocation** — zero-schema tool that always returns Pune, India, forcing a location lookup before weather.
- **Weather** — takes a city and returns deterministic pseudo-weather derived from its name, so runs are reproducible without an API key.
- **ConvertTemperature** — real Celsius/Fahrenheit math behind an enum schema, so the agent never does arithmetic from memory.
- **SendEmail** — approval-gated tool: the turn pauses for a human decision, then resumes and reports delivery.

## Two ways to talk to it

- **HTTP** — `ChatController` answers chat messages; `AgUiController` speaks the Vercel AG-UI streaming protocol for rich frontends.
- **Console** — an interactive command under `src/Command/` with streaming output, markdown, tool cards, approvals and `/new`, `/clear`, `/help`, `/exit` commands.
