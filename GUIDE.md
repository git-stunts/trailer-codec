# Trailer Codec Guide

Structured metadata in commit messages allows you to treat your Git history as a queryable database. This guide covers how to use `@git-stunts/trailer-codec` to build and parse these messages.

## 1. Async-First API

As of v1.0, the core encoding and decoding operations are asynchronous. This ensures that your application remains responsive even when processing large batches of commit messages.

```javascript
import { decodeMessage, encodeMessage } from '@git-stunts/trailer-codec';

const raw = 'Title\n\nBody\n\nKey: Value';

// Decode (returns a Promise)
const payload = await decodeMessage(raw);

// Encode (returns a Promise)
const message = await encodeMessage({
  title: 'Fix: memory leak',
  trailers: { 'Ticket-ID': '123' }
});
```

## 2. Using the Facade

For most applications, the `TrailerCodec` facade is the recommended entry point. It encapsulates the configuration and provides consistent behavior.

```javascript
import { createDefaultTrailerCodec } from '@git-stunts/trailer-codec';

const codec = createDefaultTrailerCodec();

const msg = await codec.encode({
  title: 'feat: add widgets',
  trailers: { 'Signed-off-by': 'Developer X' }
});
```

## 3. Custom Key Patterns

By default, trailer keys must be alphanumeric (plus hyphens and underscores). If your project uses a different convention (e.g., dots or slashes in keys), you can customize the pattern:

```javascript
import { createConfiguredCodec } from '@git-stunts/trailer-codec';

const { encodeMessage, decodeMessage } = createConfiguredCodec({
  keyPattern: '[A-Za-z0-9._/]+',
  keyMaxLength: 64
});

const raw = await encodeMessage({
  title: 'test',
  trailers: { 'Build.Status': 'success' }
});
```

## 4. Handling Body Formatting

Commit messages usually require a trailing newline. You can configure the codec to preserve or strip these:

```javascript
const codec = createDefaultTrailerCodec({
  bodyFormatOptions: { keepTrailingNewline: true }
});

const payload = await codec.decode('Title\n\nBody\n');
console.log(payload.body); // 'Body\n'
```

## 5. Working with Entities

If you need deeper control or want to pass metadata-rich objects through your domain, use the `GitCommitMessage` entity directly.

```javascript
import { GitCommitMessage } from '@git-stunts/trailer-codec';

const msg = new GitCommitMessage({
  title: 'chore: update deps',
  trailers: [{ key: 'Dependabot-Status', value: 'green' }]
});

// Entity toString() is currently synchronous
console.log(msg.toString());
```

## 6. Integration: Parsing Git Log

You can combine `trailer-codec` with `git log` to extract metadata from your entire project history.

```javascript
// Example using @git-stunts/plumbing
const log = await git.execute({ args: ['log', '--format=%B%x00'] });
const chunks = log.split('\0');

for (const raw of chunks) {
  if (!raw.trim()) continue;
  const decoded = await decodeMessage(raw);
  console.log(`${decoded.title} -> ${decoded.trailers['issue-id'] || 'No issue'}`);
}
```
