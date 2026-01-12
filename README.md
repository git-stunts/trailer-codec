# @git-stunts/trailer-codec

[![npm version](https://img.shields.io/npm/v/@git-stunts/trailer-codec.svg)](https://www.npmjs.com/package/@git-stunts/trailer-codec)
[![CI](https://github.com/git-stunts/trailer-codec/actions/workflows/ci.yml/badge.svg)](https://github.com/git-stunts/trailer-codec/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@git-stunts/trailer-codec.svg)](LICENSE)

A robust encoder/decoder for structured metadata within Git commit messages. Built with **Hexagonal Architecture** and **Domain-Driven Design (DDD)**.

## Key Features

- **Standard Compliant**: Follows the Git "trailer" convention (RFC 822 / Email headers)
- **DoS Protection**: Built-in 5MB message size limit to prevent attacks
- **Structured Domain**: Formalized entities and value objects for type safety
- **Zod Validation**: Schema-driven validation with helpful error messages
- **Case Normalization**: Trailer keys normalized to lowercase for consistency
- **Pure Domain Logic**: No I/O, no Git subprocess execution

## Design Principles

1. **Domain Purity**: Core logic independent of infrastructure
2. **Type Safety**: Value Objects ensure data validity at instantiation
3. **Immutability**: All entities are immutable
4. **Separation of Concerns**: Encoding/decoding in dedicated service

## Prerequisites

- **Node.js**: >= 20.0.0

## Installation

```bash
npm install @git-stunts/trailer-codec
```

## Developer & Testing

- **Node.js ≥ 20** matches the `engines` field in `package.json` and is required for Vitest/ESM support.
- `npm test` runs the Vitest suite, `npm run lint` validates the code with ESLint, and `npm run format` formats files with Prettier; all scripts target the entire repo root.
- Consult `TESTING.md` for run modes, test filters, and tips for extending the suite before submitting contributions.

## Usage

### Basic Encoding/Decoding

```javascript
import { createDefaultTrailerCodec } from '@git-stunts/trailer-codec';

const codec = createDefaultTrailerCodec();
const message = codec.encode({
  title: 'feat: add user authentication',
  body: 'Implemented OAuth2 flow with JWT tokens.',
  trailers: [
    { key: 'Signed-off-by', value: 'James Ross' },
    { key: 'Reviewed-by', value: 'Alice Smith' },
  ],
});

console.log(message);
// feat: add user authentication
//
// Implemented OAuth2 flow with JWT tokens.
//
// signed-off-by: James Ross
// reviewed-by: Alice Smith

const decoded = codec.decode(message);
console.log(decoded.title);      // "feat: add user authentication"
console.log(decoded.trailers);   // { 'signed-off-by': 'James Ross', 'reviewed-by': 'Alice Smith' }
```

### API Patterns

- **Primary entry point**: `createDefaultTrailerCodec()` returns a `TrailerCodec` wired with a fresh `TrailerCodecService`; use `.encode()`/`.decode()` (or `.encodeMessage()`/`.decodeMessage()`) to keep configuration in one place.
- **Facade**: `TrailerCodec` keeps configuration near instantiation while still leveraging `createMessageHelpers()` under the hood (pass your own service when you need control).
- **Advanced**: `createConfiguredCodec()` and direct `TrailerCodecService` usage let you swap schema bundles, parsers, formatters, or helper overrides when you need custom validation or formatting behavior. The standalone helpers `encodeMessage()`/`decodeMessage()` remain available as deprecated convenience wrappers.

### Breaking Changes

- `decodeMessage()` now trims trailing newlines in the version `v0.2.0+` runtime, so plain string inputs will no longer include a final `\n` unless you opt into it.
- To preserve the trailing newline you rely on (e.g., when round-tripping commit templates), either instantiate `TrailerCodec` with `bodyFormatOptions: { keepTrailingNewline: true }`, call `formatBodySegment(body, { keepTrailingNewline: true })` yourself, or pass the same option through `createConfiguredCodec`.
- See [`docs/MIGRATION.md#v020`](docs/MIGRATION.md#v020) for the full migration checklist and decoding behavior rationale.

### Body Formatting & Facade

`decodeMessage` now trims the decoded body by default, returning the content exactly as stored; no extra newline is appended automatically. If you still need the trailing newline (for example when writing the decoded body back into a commit template), instantiate the helpers or facade with `bodyFormatOptions: { keepTrailingNewline: true }`:

```javascript
import TrailerCodec from '@git-stunts/trailer-codec';

const codec = new TrailerCodec({ bodyFormatOptions: { keepTrailingNewline: true } });
const payload = codec.decode('Title\n\nBody\n');
console.log(payload.body); // 'Body\n'
```

You can also call the exported `formatBodySegment(body, { keepTrailingNewline: true })` helper directly when you need the formatting logic elsewhere.

```javascript
import { formatBodySegment } from '@git-stunts/trailer-codec';

const trimmed = formatBodySegment('Body\n', { keepTrailingNewline: true });
console.log(trimmed); // 'Body\n'
```

### Advanced

#### Configured Codec Builder

When you need a prewired codec (custom key patterns, parser tweaks, formatter hooks), use `createConfiguredCodec({ keyPattern, keyMaxLength, parserOptions })`. It builds a schema bundle, parser, and service for you, and returns helpers so you can immediately call `decodeMessage`/`encodeMessage`:

```javascript
import { createConfiguredCodec } from '@git-stunts/trailer-codec';

const { decodeMessage, encodeMessage } = createConfiguredCodec({
  keyPattern: '[A-Za-z._-]+',
  keyMaxLength: 120,
  parserOptions: {},
});

const payload = { title: 'feat: cli docs', trailers: { 'Custom.Key': 'value' } };
const encoded = encodeMessage(payload);
const decoded = decodeMessage(encoded);
console.log(decoded.title); // 'feat: cli docs'
```

#### Domain Entities

```javascript
import { GitCommitMessage } from '@git-stunts/trailer-codec';

const msg = new GitCommitMessage({
  title: 'fix: resolve memory leak',
  body: 'Fixed WeakMap reference cycle.',
  trailers: [
    { key: 'Issue', value: 'GH-123' },
    { key: 'Signed-off-by', value: 'James Ross' }
  ]
});

console.log(msg.toString());
```

#### Public API Helpers & Configuration

- `formatBodySegment(body, { keepTrailingNewline = false })` mirrors the helper powering `decodeMessage`, trimming whitespace while optionally preserving the trailing newline when you plan to write the body back into a template.
- `createMessageHelpers({ service, bodyFormatOptions })` returns `{ decodeMessage, encodeMessage }` bound to the provided `TrailerCodecService`; pass `bodyFormatOptions` to control whether decoded bodies keep their trailing newline.
- `TrailerCodec` wraps `createMessageHelpers()` so you can instantiate a codec class with custom `service` or `bodyFormatOptions` and still leverage the helper contract via `encode()`/`decode()`.
- `createConfiguredCodec({ keyPattern, keyMaxLength, parserOptions, formatters, bodyFormatOptions })` wires together `createGitTrailerSchemaBundle`, `TrailerParser`, `TrailerCodecService`, and the helper pair, letting you configure key validation, parser heuristics, formatting hooks, and body formatting in a single call.
- `TrailerCodecService` exposes the schema bundle, parser, trailer factory, formatter hooks, and helper utilities (`MessageNormalizer`, `extractTitle`, `composeBody`); see `docs/SERVICE.md` for a deeper explanation of how to customize each stage without touching the core service.

## ✅ Validation Rules

Trailer codec enforces strict validation via the concrete subclasses of `TrailerCodecError`:

| Rule | Constraint | Thrown Error |
|------|------------|--------------|
| **Message Size** | ≤ 5MB | `TrailerTooLargeError` |
| **Title** | Must be a non-empty string | `CommitMessageInvalidError` (during entity construction) |
| **Trailer Key** | Alphanumeric, hyphens, underscores only (`/^[A-Za-z0-9_-]+$/`) and ≤ 100 characters (prevents ReDoS) | `TrailerInvalidError` |
| **Trailer Value** | Cannot contain carriage returns or line feeds and must not be empty | `TrailerValueInvalidError` |

**Key Normalization:** All trailer keys are automatically normalized to lowercase (e.g., `Signed-Off-By` → `signed-off-by`).

**Blank-Line Guard:** Trailers must be separated from the body by a blank line; omitting the separator throws `TrailerNoSeparatorError`.

### Validation Errors

When `TrailerCodecService` or the exported helpers throw, they surface one of the following classes so you can recover with `instanceof` checks:

| Error | Trigger | Suggested Fix |
| --- | --- | --- |
| `TrailerTooLargeError` | Message exceeds 5MB while `MessageNormalizer.guardMessageSize()` runs | Split the commit or remove content until the payload fits. |
| `TrailerNoSeparatorError` | Missing blank line before trailers when `TrailerParser.split()` runs | Insert the required empty line between body and trailers. |
| `TrailerValueInvalidError` | Trailer value includes newline characters or fails the schema value rules | Remove or escape newline characters before encoding. |
| `TrailerInvalidError` | Trailer key/value pair fails the schema validation (`GitTrailerSchema`) | Adjust the key/value or supply a custom schema bundle via `TrailerCodecService`. |
| `CommitMessageInvalidError` | `GitCommitMessageSchema` rejects the full payload (title/body/trailers) | Fix the invalid field or pass a conforming payload; use formatters if needed. |

All of the above inherit from `TrailerCodecError` (`src/domain/errors/TrailerCodecError.js`) and expose `meta` for diagnostics; prefer checking the specific class instead of inspecting `code`.

## 🛡️ Security

- **No Code Execution**: Pure string manipulation, no `eval()` or dynamic execution
- **DoS Protection**: Rejects messages > 5MB
- **ReDoS Prevention**: Max key length limits regex execution time
- **No Git Subprocess**: Library performs no I/O operations
- **Line Injection Guard**: Trailer values omit newline characters so no unexpected trailers can be injected

See [SECURITY.md](SECURITY.md) for details.

## 📚 Additional Documentation

- [`docs/ADVANCED.md`](docs/ADVANCED.md) — Custom schema injection, validation overrides, and advanced integration patterns.
- [`docs/PARSER.md`](docs/PARSER.md) — Step-by-step explanation of the backward-walk parser.
- [`docs/INTEGRATION.md`](docs/INTEGRATION.md) — Git log scripting, streaming decoder, and Git-CMS filtering recipes.
- [`docs/SERVICE.md`](docs/SERVICE.md) — How `TrailerCodecService` wires schema, parser, and formatter helpers for customization.
- [`API_REFERENCE.md`](API_REFERENCE.md) — Complete catalog of the public exports, their inputs/outputs, and notable knobs.
- [`TESTING.md`](TESTING.md) — How to run/extend the Vitest, lint, and format scripts plus contributor tips.
- **Git hooks**: Run `npm run setuphooks` once per clone to point `core.hooksPath` at `scripts/`. The hook now runs just `npm run lint` and `npm run format` before each commit.

## License

Apache-2.0
Copyright © 2026 [James Ross](https://github.com/flyingrobots)
