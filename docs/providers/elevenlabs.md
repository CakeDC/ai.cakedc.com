---
description: 'ElevenLabs: speech synthesis and transcription.'
---

# ElevenLabs

Voice specialist for speech synthesis plus transcription. Use it when you
need natural-sounding narration from ElevenLabs voices, optionally with
speech-to-text on the same key. The config key is `eleven` (not
`elevenlabs`).

## Capabilities

Audio generation and transcription.

## Configuration

Configure via environment variables. `config/ai.php` only forwards them with
`env()` — set the values in `.env` or the host environment, never hardcode
keys in the config file.

```php
// In config/ai.php
return [
    'Ai' => [
        'providers' => [
            'eleven' => [
                'className' => 'Crustum\Ai\Providers\ElevenLabsProvider',
                'key' => env('ELEVENLABS_API_KEY'),
                'url' => env('ELEVENLABS_URL', 'https://api.elevenlabs.io/v1'),
                'models' => [
                    'audio' => [
                        'default' => env('ELEVENLABS_AUDIO_MODEL', 'eleven_multilingual_v2'),
                    ],
                    'transcription' => [
                        'default' => env('ELEVENLABS_TRANSCRIPTION_MODEL', 'scribe_v2'),
                    ],
                ],
            ],
        ],
    ],
];
```

| Config key | Env var | Purpose |
|---|---|---|
| `className` | — | Provider class. Keep the default unless subclassing. |
| `key` (`apiKey` also accepted) | `ELEVENLABS_API_KEY` | Key from elevenlabs.io. Required. |
| `url` | `ELEVENLABS_URL` | API base URL. Change only for proxies or gateways. |
| `models.audio.default` | `ELEVENLABS_AUDIO_MODEL` | Voice model for text-to-speech. Voice selection itself is a per-call option; this picks the synthesis engine. |
| `models.transcription.default` | `ELEVENLABS_TRANSCRIPTION_MODEL` | Speech-to-text (Scribe) model. |
| `headers` | — (config only) | Extra HTTP headers merged into every request. Add as a plain array if needed. |

Per-call `model:` overrides the configured model for that call.

## See also

- [Providers](./index.md) — capability matrix
- [Audio](./audio.md) — speech and transcription
