# Advanced Usage & Customization

`@git-stunts/trailer-codec` is built on hexagonal principles, so every core service is injectable. You can override the validation rules or trailer construction without forking the library.

## Custom Validation Rules

```javascript
import { createGitTrailerSchemaBundle, TRAILER_KEY_RAW_PATTERN_STRING, TrailerCodecService, GitTrailer } from '@git-stunts/trailer-codec';

// Allow alphanumeric, underscores, hyphens, and dots
const customBundle = createGitTrailerSchemaBundle({
  keyPattern: '[A-Za-z0-9_.-]+',
  keyMaxLength: 120,
});

const service = new TrailerCodecService({ schemaBundle: customBundle });
const encoded = service.encode({
  title: 'Custom API',
  trailers: [{ key: 'Namespace.Subfield', value: 'demo' }]
});
```

## Custom Trailer Factories

You can also replace how `GitTrailer` instances are created, which is useful for testing or adding metadata:

```javascript
const trackedFactory = (key, value, schema) => {
  const trailer = new GitTrailer(key, value, schema);
  console.log('Custom trailer created', trailer);
  return trailer;
};

const service = new TrailerCodecService({
  trailerFactory: trackedFactory
});
```

## API Helpers

Most integrations just need `encodeMessage` and `decodeMessage`. These helpers reuse a shared service instance and return/accept plain objects, making one-line usage simple:

```javascript
import { encodeMessage, decodeMessage } from '@git-stunts/trailer-codec';

const data = decodeMessage(encodeMessage({ title: 'hello', trailers: { Foo: 'Bar' } }));
```

Use this file as a reference when you need to extend validation rules without touching the core domain logic.

## Custom Parser Strategies

```javascript
import { TrailerCodecService, TrailerParser, GitTrailer } from '@git-stunts/trailer-codec';

const parser = new TrailerParser({ keyPattern: '[A-Za-z0-9.-]+' });
const service = new TrailerCodecService({
  parser,
  trailerFactory: (key, value, schema) => new GitTrailer(key, value, schema)
});
```

Pass your parser into `TrailerCodecService` so custom parsing strategies replace `_findTrailerStartIndex` and `_validateTrailerSeparation` without subclassing the service.
