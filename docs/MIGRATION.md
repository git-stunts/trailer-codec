# Migration Guide

This guide helps you upgrade between major versions of `@git-stunts/trailer-codec`.

---

## v2.0.0 → v2.1.0 (Current)

### New Features

#### Convenience Aliases
`TrailerCodec` now provides shorter method names:
```javascript
const codec = new TrailerCodec({ service });

// Both work identically:
codec.decode(message);       // ✅ New alias
codec.decodeMessage(message); // ✅ Still supported

codec.encode(payload);       // ✅ New alias
codec.encodeMessage(payload); // ✅ Still supported
```

**Migration:** No action required. Both forms work.

#### Enhanced Error Handling
All errors are now properly wrapped in domain-specific error classes:
- `TrailerInvalidError` for duplicate keys and invalid values
- `CommitMessageInvalidError` wraps all construction errors
- Better error metadata for debugging

**Migration:** If you were catching generic `Error`, update to catch specific error types:
```javascript
// Before
try {
  const msg = service.decode(input);
} catch (error) {
  if (error.message.includes('Duplicate')) {
    // handle
  }
}

// After
import { TrailerInvalidError } from '@git-stunts/trailer-codec';
try {
  const msg = service.decode(input);
} catch (error) {
  if (error instanceof TrailerInvalidError) {
    console.log(error.meta); // Access rich metadata
  }
}
```

---

## v1.x → v2.0.0

### Breaking Changes

#### 1. Body Trimming Behavior (#v020)

**What changed:** `decodeMessage()` now trims trailing newlines by default.

```javascript
// v1.x behavior
const result = decodeMessage('Title\n\nBody\n');
result.body; // 'Body\n' (kept newline)

// v2.0.0+ behavior
const result = decodeMessage('Title\n\nBody\n');
result.body; // 'Body' (trimmed)
```

**Why:** Consistency with how commit messages are typically stored and displayed.

**Migration options:**

**Option 1:** Use `keepTrailingNewline` if you need the old behavior
```javascript
import { TrailerCodec } from '@git-stunts/trailer-codec';

const codec = new TrailerCodec({
  service,
  bodyFormatOptions: { keepTrailingNewline: true }
});

const result = codec.decode('Title\n\nBody\n');
result.body; // 'Body\n'
```

**Option 2:** Use `formatBodySegment` helper directly
```javascript
import { formatBodySegment } from '@git-stunts/trailer-codec';

const trimmed = formatBodySegment('Body\n', { keepTrailingNewline: true });
console.log(trimmed); // 'Body\n'
```

**Option 3:** Add newline manually when needed
```javascript
const result = codec.decode(message);
const bodyWithNewline = result.body ? `${result.body}\n` : '';
```

#### 2. Hexagonal Architecture Refactor

**What changed:** Internal structure reorganized around DDD principles.

**Impact:** If you were importing internal paths (not recommended), update to public API:

```javascript
// ❌ Before (internal imports)
import GitCommitMessage from '@git-stunts/trailer-codec/src/domain/entities/GitCommitMessage';

// ✅ After (public API)
import { GitCommitMessage } from '@git-stunts/trailer-codec';
```

**Public API exports:**
- `GitCommitMessage` - Domain entity
- `GitTrailer` - Value object
- `TrailerCodecService` - Core service
- `TrailerCodec` - Facade class
- `TrailerParser` - Parser service
- `createDefaultTrailerCodec()` - Factory
- `createConfiguredCodec()` - Advanced factory
- `createMessageHelpers()` - Helper factory
- Error classes and schemas

#### 3. Schema-Based Validation (Zod v4)

**What changed:** All validation now uses Zod schemas.

**Impact:** Validation errors have more structure:

```javascript
// v1.x
catch (error) {
  console.log(error.message); // Generic string
}

// v2.0.0+
catch (error) {
  if (error instanceof TrailerInvalidError) {
    console.log(error.meta.issues); // Structured validation issues
    console.log(error.meta.key);    // Which trailer failed
  }
}
```

#### 4. Trailer Key Normalization

**What changed:** Trailer keys are automatically normalized to lowercase.

```javascript
// v1.x
const trailer = new GitTrailer('Signed-Off-By', 'Alice');
trailer.key; // 'Signed-Off-By' (preserved case)

// v2.0.0+
const trailer = new GitTrailer('Signed-Off-By', 'Alice');
trailer.key; // 'signed-off-by' (normalized)
```

**Why:** Git trailer keys are case-insensitive by convention.

**Migration:** Update code that expects specific casing:
```javascript
// Before
if (trailers['Signed-Off-By']) { }

// After
if (trailers['signed-off-by']) { }
```

#### 5. Security Enhancements

**Added:** DoS protections enabled by default:
- 5MB message size limit
- 100-character key length limit (configurable)
- 256-character regex pattern limit
- 16-quantifier ReDoS protection

**Impact:** Messages exceeding limits now throw `TrailerTooLargeError`.

```javascript
// v2.0.0+ will throw for > 5MB messages
try {
  const huge = 'a'.repeat(6 * 1024 * 1024);
  service.decode(huge);
} catch (error) {
  if (error instanceof TrailerTooLargeError) {
    console.log(error.meta.messageByteLength);
    console.log(error.meta.maxSize);
  }
}
```

**Override limits (advanced):**
```javascript
import MessageNormalizer from '@git-stunts/trailer-codec';

const normalizer = new MessageNormalizer({
  maxMessageSize: 10 * 1024 * 1024 // 10MB
});

const service = new TrailerCodecService({
  messageNormalizer: normalizer
});
```

#### 6. Constructor Signature Changes

**GitCommitMessage:**
```javascript
// v1.x
new GitCommitMessage(title, body, trailers);

// v2.0.0+
new GitCommitMessage({ title, body, trailers });
```

**TrailerCodec:**
```javascript
// v1.x (didn't exist)

// v2.0.0+
new TrailerCodec({ service, bodyFormatOptions });
```

---

## Testing Your Migration

### 1. Run Your Test Suite
```bash
npm test
```

### 2. Check for Deprecated Warnings
```bash
# Enable Node.js deprecation warnings
NODE_OPTIONS='--trace-deprecation' npm test
```

### 3. Validate Error Handling
Ensure you're catching the new error types:
- `TrailerCodecError` (base)
- `TrailerTooLargeError`
- `TrailerNoSeparatorError`
- `TrailerInvalidError`
- `TrailerValueInvalidError`
- `CommitMessageInvalidError`

### 4. Check Trailer Key Usage
Search for hardcoded trailer keys with capital letters:

---

## Getting Help

If you encounter issues during migration:

1. Check the [API Reference](../API_REFERENCE.md)
2. Review [examples in the README](../README.md#usage)
3. Open an issue on [GitHub](https://github.com/git-stunts/trailer-codec/issues)

---

## Rollback

If you need to rollback to v1.x:

```bash
npm install @git-stunts/trailer-codec@1.x
```

Note: v1.x is no longer maintained. We recommend migrating to v2.x.
