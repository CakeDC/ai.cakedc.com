---
description: 'Audio: speech synthesis and transcription.'
---

# Audio

Two directions, one page: `Audio::of()` turns text into speech, and
`Transcription::fromPath()` (or storage, upload) turns audio back into
text. OpenAI and ElevenLabs cover both; Gemini, Mistral, and Groq cover
transcription alongside their other capabilities.

## Speech

Pick a voice (`male()`, `female()`, or `voice('name')`), optionally coach
delivery with `instructions()`, then generate. The response stringifies to
its audio bytes and stores to the configured filesystem:

```php
use Crustum\Ai\Audio;

$audio = Audio::of('I love coding with CakePHP.')->generate();
echo $audio->mimeType() . PHP_EOL;
echo strlen((string)$audio) . " bytes\n";
```

```text [Output]
audio/mp3
56 bytes
```

`store()`, `storeAs('audio.mp3')`, `storePublicly()`, and
`storePubliclyAs()` persist the bytes; `timeout()` bounds the request.
Generation queues like everything else. `queue()->then(fn ($audio) =>
$audio->store())` runs the store after the worker finishes.

## Transcription

Any transcribable audio file transcribes with `generate()`; `diarize()`
adds per-speaker segments alongside the raw text:

```php
use Crustum\Ai\Transcription;

$transcript = Transcription::fromPath('/var/www/audio.mp3')->generate();
echo (string)$transcript . PHP_EOL;
```

```text [Output]
harness-transcript
```

Uploads and stored files work the same way (`fromUpload($request->getData(...))`,
`fromStorage('audio.mp3')`). Transcription queues with a
`TranscriptionResponse` in the `then()` callback, and takes provider
options and headers per request like the other builders.

## See also

- [Providers](./index.md) — capability matrix
- [ElevenLabs](./elevenlabs.md) — voices and Scribe
- [OpenAI](./openai.md) — the transcription default
