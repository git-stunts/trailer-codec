# @git-stunts/trailer-codec

A robust encoder/decoder for structured metadata within Git commit messages. Refactored with **Hexagonal Architecture** and **Domain-Driven Design (DDD)**.

## 🚀 Key Features

- **Standard Compliant**: Follows the Git "trailer" convention (RFC 822 / Email headers).
- **Structured Domain**: Uses formalized domain entities and value objects for commit messages and trailers.
- **Robust Validation**: Centralized validation powered by **Zod**.
- **Case Normalization**: Trailer keys are normalized to lowercase for consistent lookups.

## 🏗️ Design Principles

1. **Domain Purity**: Core logic is independent of any infrastructure or framework.
2. **Type Safety**: Formal Value Objects ensure that data is valid upon instantiation.
3. **Separation of Concerns**: Encoding/decoding logic is encapsulated in a dedicated domain service.

## 📋 Prerequisites

- **@git-stunts/plumbing**: >= 2.7.0
- **Node.js**: >= 20.0.0

## 📦 Installation

```bash
npm install @git-stunts/trailer-codec
```

## 🛠️ Usage

```javascript
import TrailerCodec, { GitCommitMessage } from '@git-stunts/trailer-codec';

const codec = new TrailerCodec();

// Encoding from high-level entity
const messageEntity = new GitCommitMessage({
  title: 'My Article',
  body: 'This is the content.',
  trailers: [
    { key: 'status', value: 'draft' },
    { key: 'author', value: 'James Ross' },
  ],
});

const rawMessage = codec.encode(messageEntity);

// Decoding to entity
const decoded = codec.decode({ message: rawMessage });
console.log(decoded.title); // "My Article"
console.log(decoded.trailers); // [{ key: 'status', value: 'draft' }, ...]
```

## 📄 License

Apache-2.0
