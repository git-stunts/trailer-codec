# TrailerCodecService Internals

`TrailerCodecService` is the heart of `@git-stunts/trailer-codec`. This document explains how the service decodes/encodes commit messages, what helper classes it injects, and how to customize each stage without touching the core class (`src/domain/services/TrailerCodecService.js`).

## Constructor inputs

| Option | Default | Purpose |
| --- | --- | --- |
| `schemaBundle` | `getDefaultTrailerSchemaBundle()` | Supplies `GitTrailerSchema`, `keyPattern`, and `keyRegex`. Pass a custom bundle from `createGitTrailerSchemaBundle()` to change validation rules. |
| `trailerFactory` | `new GitTrailer(key, value, schema)` | Creates trailer value objects. Swap this out for instrumentation or a different trailer implementation. |
| `parser` | `new TrailerParser({ keyPattern: schemaBundle.keyPattern })` | Splits body vs trailers, validates the blank-line separator, and exposes `lineRegex` (compiled from `schemaBundle.keyPattern`) so you can match each trailer line consistently. Inject a decorated parser to control detection heuristics and refer to [`docs/PARSER.md`](docs/PARSER.md) for parser internals. |
| `messageNormalizer` | `new MessageNormalizer()` | Normalizes line endings (`\r\n` → `\n`) and guards against messages > 5 MB (throws `TrailerTooLargeError`). Override to adjust the max size or normalization logic. |
| `titleExtractor` | `extractTitle` | Grabs the first line as the title, trims it, and skips consecutive blank lines. Replace to support multi-line titles or custom separators. |
| `bodyComposer` | `composeBody` | Trims leading/trailing blank lines from the body while preserving user whitespace inside. Swap it when you want to preserve blank lines that occur at the edges. |
| `formatters` | `{}` | Accepts `{ titleFormatter, bodyFormatter }` functions applied before serialization. Use them to normalize casing, apply templates, or inject defaults before `encode()`. |

TrailerParser compiles the `schemaBundle.keyPattern` into `parser.lineRegex` during construction, so each trailer line is matched with the same RegExp used for validation; refer to [`docs/PARSER.md`](docs/PARSER.md) or `TrailerParser` constructor docs for more detail when you override this behavior.

## Decode pipeline (see `decode()` in `src/domain/services/TrailerCodecService.js`)

1. **Empty message guard** — Immediately returns an empty `GitCommitMessage` when given `undefined`/`''` so downstream code receives an entity instead of `null`.
2. **Message size check** — `MessageNormalizer.guardMessageSize()` enforces the 5 MB limit and throws `TrailerTooLargeError` when exceeded.
3. **Line normalization** — `MessageNormalizer.normalizeLines()` converts `
` to `
` and splits into lines.
4. **Title extraction** — `extractTitle()` takes the first line, trims it, and skips all blank lines between the title and body.
5. **Split body/trailers** — `TrailerParser.split()` walks backward from the end of the message (using `_findTrailerStart`) to locate the trailer block and enforce the blank-line guard (`TrailerNoSeparatorError`).
6. **Compose body** — `composeBody()` trims blank lines from the edges but keeps inner spacing intact.
7. **Build trailers** — Iterates over the trailer lines, matches each against `parser.lineRegex`, and calls `trailerFactory(key, value, schemaBundle.schema)` to convert them into `GitTrailer` instances.
8. **Entity construction** — Returns a `GitCommitMessage` with the normalized title/body and the built trailers; `formatters` (e.g., `titleFormatter`, `bodyFormatter`) run during this step.

## Encode pipeline

- `encode(messageEntity)` accepts either a `GitCommitMessage` instance or a plain object. If it is not already an entity, it constructs a new `GitCommitMessage` using the same `schemaBundle` and `formatters`, ensuring validation still runs.
- `GitCommitMessage.toString()` outputs the final commit string (title, blank line, body, blank line, trailers) and trims trailing whitespace.

## Customization points

- **Schema bundle**: call `createGitTrailerSchemaBundle()` with `keyPattern`/`keyMaxLength` and pass it as `schemaBundle` to alter validation.
- **Parser**: supply a custom `TrailerParser` (e.g., with a `parserOptions` object) via `createConfiguredCodec`; it can override `_findTrailerStart` heuristics while still leveraging the rest of the service.
- **Trailer factory**: use `trailerFactory` to wrap `GitTrailer` creation with logging, metrics, or a different subclass.
- **Helpers**: replace `MessageNormalizer`, `extractTitle`, or `composeBody` when you need different normalization or trimming strategies (useful for non-Git commit inputs).
- **Formatters**: pass `formatters` (e.g., `{ titleFormatter: (value) => value.toUpperCase() }`) to modify the title/body before serialization.

For a ready-to-use abstraction, prefer `createConfiguredCodec()` (which wires your custom schema, parser, and formatters) or extend `TrailerCodecService` via dependency injection rather than subclassing.
