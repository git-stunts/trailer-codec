# @git-stunts/trailer-codec

[![npm version](https://img.shields.io/npm/v/@git-stunts/trailer-codec.svg)](https://www.npmjs.com/package/@git-stunts/trailer-codec)
[![CI](https://github.com/git-stunts/trailer-codec/actions/workflows/ci.yml/badge.svg)](https://github.com/git-stunts/trailer-codec/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@git-stunts/trailer-codec.svg)](LICENSE)

A robust encoder/decoder for structured metadata within Git commit messages. Built with **Hexagonal Architecture** and **Domain-Driven Design (DDD)**.

## 🚀 Key Features

- **Standard Compliant**: Follows the Git "trailer" convention (RFC 822 / Email headers)
- **DoS Protection**: Built-in 5MB message size limit to prevent attacks
- **Structured Domain**: Formalized entities and value objects for type safety
- **Zod Validation**: Schema-driven validation with helpful error messages
- **Case Normalization**: Trailer keys normalized to lowercase for consistency
- **Pure Domain Logic**: No I/O, no Git subprocess execution

## 🏗️ Design Principles

1. **Domain Purity**: Core logic independent of infrastructure
2. **Type Safety**: Value Objects ensure data validity at instantiation
3. **Immutability**: All entities are immutable
4. **Separation of Concerns**: Encoding/decoding in dedicated service

## 📋 Prerequisites

- **Node.js**: >= 20.0.0

## 📦 Installation

```bash
npm install @git-stunts/trailer-codec
```

## 🛠️ Developer & Testing

- **Node.js ≥ 20** matches the `engines` field in `package.json` and is required for Vitest/ESM support.
- `npm test` runs the Vitest suite, `npm run lint` validates the code with ESLint, and `npm run format` formats files with Prettier; all scripts target the entire repo root.
- Consult `TESTING.md` for run modes, test filters, and tips for extending the suite before submitting contributions.

## ☂️ Peer Dependencies

`@git-stunts/trailer-codec` is built on top of **Zod v4**. If you install it in an existing project, ensure `zod` is also installed (>= 4.3.5) so all runtime schemas resolve cleanly.

## 🛠️ Usage

### Basic Encoding/Decoding

```javascript
import { encodeMessage, decodeMessage } from '@git-stunts/trailer-codec';

const message = encodeMessage({
  title: 'feat: add user authentication',
  body: 'Implemented OAuth2 flow with JWT tokens.',
  trailers: {
    'Signed-off-by': 'James Ross',
    'Reviewed-by': 'Alice Smith'
  }
});

console.log(message);
// feat: add user authentication
//
// Implemented OAuth2 flow with JWT tokens.
//
// signed-off-by: James Ross
// reviewed-by: Alice Smith

const decoded = decodeMessage(message);
console.log(decoded.title);      // "feat: add user authentication"
console.log(decoded.trailers);   // { 'signed-off-by': 'James Ross', 'reviewed-by': 'Alice Smith' }
```

### API Patterns

- **Primary entry points**: `encodeMessage()` and `decodeMessage()` are the recommended helpers for most integrations; they share the same `TrailerCodecService` instance and return plain objects so you can stay focused on payloads.
- **Facade**: `TrailerCodec` wraps the helpers with class-based `encode()`/`decode()` methods when you want configuration close to instantiation and a dedicated instance for helper state.
- **Advanced**: `createConfiguredCodec()` and direct `TrailerCodecService` usage let you swap schema bundles, parsers, formatters, or helper overrides when you need custom validation or formatting behavior.

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
- `TrailerCodecService` exposes the schema bundle, parser, trailer factory, formatter hooks, and helper classes (`MessageNormalizer`, `TitleExtractor`, `BodyComposer`); see `docs/SERVICE.md` for a deeper explanation of how to customize each stage without touching the core service.

## ✅ Validation Rules

Trailer codec enforces strict validation:

| Rule | Constraint | Error Type |
|------|-----------|------------|
| **Message Size** | ≤ 5MB | `ValidationError` |
| **Title** | Must be non-empty string | `ValidationError` |
| **Trailer Key** | Alphanumeric, hyphens, underscores only (`/^[A-Za-z0-9_-]+$/`) | `ValidationError` |
| **Key Length** | ≤ 100 characters (prevents ReDoS) | `ValidationError` |
| **Trailer Value** | Must be non-empty string | `ValidationError` |

**Key Normalization:** All trailer keys are automatically normalized to lowercase (e.g., `Signed-Off-By` → `signed-off-by`).

**Blank-Line Guard:** Trailers must be separated from the body by a blank line; committing without that empty line results in a `ValidationError`.

**Trailer Line Limits:** Trailer values cannot contain carriage returns or line feeds.

### Validation Error Codes

| Code | Trigger | Suggested Fix |
| --- | --- | --- |
| `TRAILER_TOO_LARGE` | Message exceeds 5MB | Split the commit or remove content until the payload fits |
| `TRAILER_NO_SEPARATOR` | Missing blank line before trailers | Insert an empty line between the body and the trailer metadata |
| `TRAILER_VALUE_INVALID` | Trailer value contains newline characters | Remove newlines from the value before encoding |
| `TRAILER_INVALID` | Trailer key or value fails schema validation | Adjust the key/value or pass a custom schema bundle via `TrailerCodecService` |

Each code appears on the thrown `ValidationError` (`src/domain/errors/ValidationError.js`), so you can read `error.code` and `error.meta` to respond. See `API_REFERENCE.md#validation-errors` for the class signature and recommended recovery guidance for each code.

## 🛡️ Security

- **No Code Execution**: Pure string manipulation, no `eval()` or dynamic execution
- **DoS Protection**: Rejects messages > 5MB
- **ReDoS Prevention**: Max key length limits regex execution time
- **No Git Subprocess**: Library performs no I/O operations
- **Line Injection Guard**: Trailer values omit newline characters so no unexpected trailers can be injected

See [SECURITY.md](SECURITY.md) for details.

## 📚 Additional Documentation

- [`docs/ADVANCED.md`](docs/ADVANCED.md) — Custom schema injection, validation overrides, and advanced integration patterns
- [`docs/PARSER.md`](docs/PARSER.md) — Step-by-step explanation of the backward-walk parser
- [`docs/MIGRATION.md`](docs/MIGRATION.md) — Notes for upgrading from earlier versions
- [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) — Micro-benchmark insights
- [`docs/RELEASE.md`](docs/RELEASE.md) — Checklist for version bumps and npm publishing
- [`docs/INTEGRATION.md`](docs/INTEGRATION.md) — Git log scripting, streaming decoder, and Git-CMS filtering recipes
- [`docs/SERVICE.md`](docs/SERVICE.md) — How `TrailerCodecService` wires schema, parser, and formatter helpers for customization
- [`API_REFERENCE.md`](API_REFERENCE.md) — Complete catalog of the public exports, their inputs/outputs, and notable knobs
- [`TESTING.md`](TESTING.md) — How to run/extend the Vitest, lint, and format scripts plus contributor tips

## 📄 License

Apache-2.0
