# API Reference

This file catalogs every public export from `@git-stunts/trailer-codec` so you can confidently import, configure, and extend the codec.

## Encoding & decoding helpers

### `decodeMessage(message: string)`
- Deprecated convenience wrapper around `new TrailerCodec().decode(message)`.
- Input: a raw commit payload (title, optional body, trailers) as a string.
- Output: `{ title: string, body: string, trailers: Record<string, string> }` where `body` is trimmed via `formatBodySegment` (see below) and trailer keys are normalized to lowercase.
- Throws `ValidationError` for invalid titles, missing blank-line separators, oversized messages, or malformed trailers.

### `encodeMessage({ title: string, body?: string, trailers?: Record<string, string> })`
-- Deprecated convenience wrapper around `new TrailerCodec().encode(payload)`.
- Builds a `GitCommitMessage` under the hood and returns the canonical string. Trailers are converted from plain objects to `GitTrailer` instances via the default factory (see `GitTrailer` below).

### `formatBodySegment(body?: string, { keepTrailingNewline = false })`
- Shared helper for `decodeMessage` to trim whitespace while optionally keeping a trailing newline when you plan to write the body back into a template.

### `createMessageHelpers({ service, bodyFormatOptions } = {})`
- Returns `{ decodeMessage, encodeMessage }` bound to the injected `TrailerCodecService` instance; a new service is created when none is provided.
- Supports `bodyFormatOptions` (forwarded to `formatBodySegment`) and is useful for advanced/test wiring.

### `createDefaultTrailerCodec({ bodyFormatOptions } = {})`
- Creates a new `TrailerCodecService`, builds a `TrailerCodec`, and returns it so you can call `encodeMessage()`/`decodeMessage()` without manually wiring services.

### `TrailerCodec`
- Constructor opts: `{ service = new TrailerCodecService(), bodyFormatOptions }`.
- Exposes `decode(input)` and `encode(payload)` methods that delegate to `createMessageHelpers()`.

### `createConfiguredCodec({ keyPattern, keyMaxLength, parserOptions, formatters, bodyFormatOptions } = {})`
- Creates a schema bundle via `createGitTrailerSchemaBundle`, a `TrailerParser`, and a `TrailerCodecService`, then exposes `{ service, helpers, decodeMessage, encodeMessage }`.
- Use this when you need custom trailer patterns, parser tweaks, formatter hooks, or tightly controlled key lengths.

## Domain model exports

-### `GitCommitMessage`
```ts
new GitCommitMessage(
  payload: { title: string; body?: string; trailers?: GitTrailerInput[] },
  options?: { trailerSchema?: ReturnType<typeof getDefaultTrailerSchemaBundle>['schema']; formatters?: { titleFormatter?: (value: string) => string; bodyFormatter?: (value: string) => string } }
);
```
- Validates via `GitCommitMessageSchema`, normalizes title/body with optional formatters, and converts `trailers` to `GitTrailer` instances.
- `toString()` returns a Git-style commit string (title, optional body, blank line, trailers).

### `GitTrailer`
- Accepts `(key: string, value: string, schema = GitTrailerSchema)`.
- Validates using `GitTrailerSchema` and normalizes the key to lowercase and the value to a trimmed string.
- Throws `ValidationError` with codes `TRAILER_INVALID` or `TRAILER_VALUE_INVALID` if the provided data fails schema validation.

## Services & parsers

### `TrailerCodecService`
- Core decode/encode logic; see `docs/SERVICE.md` for how the pipeline is wired.
- Constructor options:
  - `schemaBundle`: result of `createGitTrailerSchemaBundle({ keyPattern, keyMaxLength })` (defaults: `keyPattern` = `[A-Za-z0-9_-]+`, `keyMaxLength` = `100`, see the schema section below).
  - `trailerFactory`: function that instantiates trailers (defaults to `GitTrailer`).
  - `parser`: instance of `TrailerParser`.
  - `messageNormalizer`, `titleExtractor`, `bodyComposer`: helper classes that normalize lines, extract the title, and compose the body.
  - `formatters`: optional `{ titleFormatter, bodyFormatter }` that run before serialization.
- `decode(message)` enforces message size, normalizes lines, extracts the title, splits body/trailers with `TrailerParser`, composes the body, builds trailers with `trailerFactory`, and constructs a `GitCommitMessage`.
  - `encode(messageEntity)` accepts either a `GitCommitMessage` instance or a plain payload object, validates it against `GitCommitMessageSchema`, and returns the canonical commit string produced by the entity.

### `TrailerParser`
- Constructor takes `{ keyPattern = TRAILER_KEY_PATTERN_STRING }`.
- `split(lines)` finds where the trailer block begins (walks backward, validates the blank-line separator) and returns `{ bodyLines, trailerLines }`.
- Used internally by `TrailerCodecService` and is injectable for custom parsing strategies.

## Schemas & constants

### `createGitTrailerSchemaBundle({ keyPattern, keyMaxLength } = {})`
- Returns `{ schema, keyPattern, keyRegex }` with the schema used by `GitTrailer` and `GitCommitMessage`.
- Default `keyPattern` is `[A-Za-z0-9_-]+` and `keyMaxLength` defaults to `100`.

### `TRAILER_KEY_PATTERN_STRING` / `TRAILER_KEY_REGEX`
- Exported from the default schema bundle; use them to keep custom parsers aligned with validation rules.

## Errors

### `TrailerCodecError`
- Base error type used by `ValidationError`.
- Signature: `(message: string, code: string, meta: Record<string, unknown> = {})`.

### `ValidationError`
- Extends `TrailerCodecError` and introduces the following codes:

| Code | Thrown by | Meaning |
| --- | --- | --- |
| `TRAILER_TOO_LARGE` | `MessageNormalizer.guardMessageSize` (called by `TrailerCodecService.decode` and the exported `decodeMessage`) | Message exceeds the 5 MB guard in `MessageNormalizer`. |
| `TRAILER_NO_SEPARATOR` | `TrailerParser.split` / `TrailerCodecService.decode` when the blank-line guard fails | A trailer block was found without a blank line separating it from the body (see `TrailerParser`). |
| `TRAILER_VALUE_INVALID` | `GitTrailer` via `GitTrailerSchema.parse` when constructing trailers | A trailer value violated the `GitTrailerSchema` (e.g., contained `\n`). |
| `TRAILER_INVALID` | `GitTrailer` via `GitTrailerSchema.parse` when constructing trailers | Trailer key or value failed validation (`GitTrailerSchema`). |
| `COMMIT_MESSAGE_INVALID` | `GitCommitMessage` via `GitCommitMessageSchema.parse` (triggered by `TrailerCodecService.decode` or `encode`) | The `GitCommitMessageSchema` rejected the title/body/trailers combination. |

The thrown `ValidationError` exposes `code` and `meta` for programmatic recovery; refer to `docs/SERVICE.md` or `README.md#validation-error-codes` for how to react in your integration.
