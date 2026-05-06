# @git-stunts/trailer-codec

[![npm version](https://img.shields.io/npm/v/@git-stunts/trailer-codec.svg)](https://www.npmjs.com/package/@git-stunts/trailer-codec)
[![License](https://img.shields.io/npm/l/@git-stunts/trailer-codec.svg)](LICENSE)
[![CI](https://github.com/git-stunts/trailer-codec/actions/workflows/ci.yml/badge.svg)](https://github.com/git-stunts/trailer-codec/actions/workflows/ci.yml)

> **Robust, Async-First Metadata Encoding for Git Commits.**

`@git-stunts/trailer-codec` is a professional-grade encoder/decoder for structured metadata (trailers) within Git commit messages. It follows the standard Git trailer convention (RFC 822 / Email headers) while providing industrial safety features and a type-safe domain model.

<img width="420" src="https://github.com/user-attachments/assets/0a3800d9-12c4-4639-b6c3-b1782bf28c96" align="right" />

## 📦 Key Features

- **Async-First API**: Modernized for v1.0, support for non-blocking encoding/decoding.
- **DoS Protection**: Built-in 5MB message size limit and ReDoS-hardened regex.
- **Structured Domain**: Formalized Entities and Value Objects (GitCommitMessage, GitTrailer).
- **Zod Validation**: Schema-driven validation with diagnostic error objects.
- **Pure Domain Logic**: Zero I/O, zero subprocesses. Safe for any runtime (Node, Bun, Deno, Web).
- **Case Normalization**: Automatic normalization of trailer keys for consistent querying.

## 🚀 Quick Start

### Basic Encoding

```javascript
import { createDefaultTrailerCodec } from '@git-stunts/trailer-codec';

const codec = createDefaultTrailerCodec();

const message = await codec.encode({
  title: 'feat: add user authentication',
  body: 'Implemented OAuth2 flow with JWT tokens.',
  trailers: {
    'Signed-off-by': 'James Ross',
    'Reviewed-by': 'Alice Smith'
  }
});
```

### Basic Decoding

```javascript
const payload = await codec.decode(message);

console.log(payload.title);    // "feat: add user authentication"
console.log(payload.trailers); // { "signed-off-by": "James Ross", ... }
```

## 📖 Documentation

- [**Standard Guide**](./GUIDE.md) - Common patterns and advanced configuration.
- [**API Reference**](./API_REFERENCE.md) - Exhaustive export catalog.
- [**Security Model**](./SECURITY.md) - Details on DoS and ReDoS protection.
- [**Integration Recipes**](./docs/INTEGRATION.md) - How to use with `git log` and CI pipelines.

## 🛠️ Validation Rules

| Rule | Constraint | Thrown Error |
|------|------------|--------------|
| **Message Size** | ≤ 5MB | `TrailerTooLargeError` |
| **Trailer Key** | Alphanumeric, hyphens, underscores | `TrailerInvalidError` |
| **Trailer Value** | No line breaks, non-empty | `TrailerValueInvalidError` |
| **Structure** | Blank line must separate body from trailers | `TrailerNoSeparatorError` |

## 📄 License

Apache-2.0
