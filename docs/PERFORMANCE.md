# Performance Notes

While the dedicated benchmark suite was removed, the codec remains performant thanks to the backward parser and single-pass trimming. You can measure throughput using a simple Node script:

```javascript
import { encodeMessage, decodeMessage } from '@git-stunts/trailer-codec';

const sample = encodeMessage({
  title: 'perf sample',
  body: 'This is a body',
  trailers: { 'Signed-off-by': 'perf' }
});

const iterations = 5_000;
const start = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
  decodeMessage(sample);
}
const end = process.hrtime.bigint();
console.log(`Decoded ${iterations} messages in ${Number(end - start) / 1e6}ms`);
```

Use this pattern with `node --loader=ts-node/esm` or with plain ECMAScript if you compile ahead of time.

Key takeaways:

- The parser avoids duplicated `join`/`trim` operations, so working set stays small even for 5MB messages.
- Trailer validation occurs on each `GitTrailer` creation, so expect sub-millisecond latencies for individual messages.
