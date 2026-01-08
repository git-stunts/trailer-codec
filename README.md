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

## 🛠️ Usage

### Basic Encoding/Decoding

```javascript
import TrailerCodec from '@git-stunts/trailer-codec';

const codec = new TrailerCodec();

// Encode from plain object
const message = codec.encode({
  title: 'feat: add user authentication',
  body: 'Implemented OAuth2 flow with JWT tokens.',
  trailers: {
    'Signed-off-by': 'James Ross',
    'Reviewed-by': 'Big Dogg'
  }
});

console.log(message);
// feat: add user authentication
//
// Implemented OAuth2 flow with JWT tokens.
//
// signed-off-by: James Ross
// reviewed-by: Alice Smith

// Decode back to structured data
const decoded = codec.decode(message);
console.log(decoded.title);      // "feat: add user authentication"
console.log(decoded.trailers);   // [GitTrailer, GitTrailer]
```

### Using Domain Entities

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

## 🛡️ Security

- **No Code Execution**: Pure string manipulation, no `eval()` or dynamic execution
- **DoS Protection**: Rejects messages > 5MB
- **ReDoS Prevention**: Max key length limits regex execution time
- **No Git Subprocess**: Library performs no I/O operations

See [SECURITY.md](SECURITY.md) for details.

## 📄 License

Apache-2.0
