# Security Model

@git-stunts/trailer-codec is a pure domain-layer library for encoding and decoding Git commit message trailers. It performs no I/O and spawns no subprocesses.

## 🛡️ Design Philosophy

This library treats commit messages as **untrusted input** and validates them strictly before parsing.

## ✅ Validation Strategy

- **Zod Schemas**: All inputs are validated through Zod schemas before entity instantiation
- **No Code Injection**: The library performs pure string manipulation with no `eval()` or dynamic code execution
- **Immutable Entities**: All domain entities are immutable; operations return new instances

## 🛡️ DoS Protection

This library includes multiple layers of protection against Denial of Service attacks:

### Message Size Limit
- **Limit:** 5MB (5,242,880 bytes) per commit message
- **Enforced by:** `MessageNormalizer.guardMessageSize()`
- **Error thrown:** `TrailerTooLargeError`
- **Rationale:** Prevents memory exhaustion from maliciously large inputs

```javascript
// Messages exceeding 5MB are rejected
try {
  const huge = 'a'.repeat(6 * 1024 * 1024);
  service.decode(huge);
} catch (error) {
  console.log(error instanceof TrailerTooLargeError); // true
  console.log(error.meta.messageByteLength);
  console.log(error.meta.maxSize);
}
```

### Key Length Limit
- **Default limit:** 100 characters per trailer key
- **Configurable:** Via `createGitTrailerSchemaBundle({ keyMaxLength })`
- **Rationale:** Prevents ReDoS attacks on key validation regex

### Pattern Length Limit
- **Limit:** 256 characters for custom key patterns
- **Enforced by:** `buildKeyRegex()` in `GitTrailerSchema.js`
- **Rationale:** Limits regex complexity

### Quantifier Limit
- **Limit:** 16 quantifiers (`*`, `+`, `{n,m}`) per pattern
- **Enforced by:** Pattern validation in `GitTrailerSchema.js`
- **Rationale:** Prevents catastrophic backtracking (ReDoS)

### Line Break Protection
- **Constraint:** Trailer values cannot contain `\r` or `\n` characters
- **Error thrown:** `TrailerValueInvalidError`
- **Rationale:** Prevents trailer injection attacks

```javascript
// This will throw TrailerValueInvalidError
new GitTrailer('key', 'value\ninjected: malicious');
```

## 🔧 Customizing Security Limits

Advanced users can customize limits (use with caution):

```javascript
import { TrailerCodecService, MessageNormalizer, createGitTrailerSchemaBundle } from '@git-stunts/trailer-codec';

// Custom message size limit (10MB)
const normalizer = new MessageNormalizer({
  maxMessageSize: 10 * 1024 * 1024
});

// Custom key length limit (120 chars)
const schemaBundle = createGitTrailerSchemaBundle({
  keyMaxLength: 120
});

const service = new TrailerCodecService({
  messageNormalizer: normalizer,
  schemaBundle: schemaBundle
});
```

**Warning:** Increasing limits may expose your application to DoS attacks. Only adjust if you have a specific use case and understand the risks.

## 🚫 What This Library Does NOT Do

- **No Git Execution**: This library does not spawn Git processes
- **No File System Access**: Pure in-memory operations only
- **No Network Access**: This library makes no runtime network calls
- **Minimal Direct Dependencies**: Zod is the sole direct external dependency; any transitive dependencies introduced by Zod are inherited and should be audited separately

## 🐞 Reporting a Vulnerability

If you discover a security vulnerability, please send an e-mail to james@flyingrobots.dev.
