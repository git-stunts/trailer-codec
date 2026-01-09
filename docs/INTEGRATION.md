# Integration Guide

`decodeMessage()` returns `{ title: string, body: string, trailers: Record<string,string> }` (see `API_REFERENCE.md#encoding--decoding-helpers`). `.title` is the first commit line, `.body` trims leading/trailing blanks to provide the content between title and trailers, and `.trailers` is an object of normalized lowercase keys (empty when no trailers exist). `formatBodySegment(segment)` expects a string and returns the trimmed segment, optionally keeping a trailing newline when `keepTrailingNewline: true`. `decodeMessage()` throws validation subclasses such as `TrailerNoSeparatorError`, `TrailerValueInvalidError`, or `CommitMessageInvalidError` instead of returning an error object, so callers should wrap calls in try/catch if they want to handle failures gracefully.

Blend `@git-stunts/trailer-codec` with Git history and tooling to treat commit trailers as structured metadata.

## Decode trailers from `git log --format=%B`

1. Capture the raw commit body (title+body+trailers) with:

   ```bash
   git log --format=%B
   ```

2. Pipe each commit body into a Node script that reuses `decodeMessage`:

   ```bash
   git log --format=%B | node scripts/processCommits.js
   ```

3. Example `scripts/processCommits.js`:

   ```javascript
   import { decodeMessage } from '@git-stunts/trailer-codec';

   process.stdin.setEncoding('utf8');
   let buffer = '';

   process.stdin.on('data', (chunk) => {
     buffer += chunk;
   });

   process.stdin.on('end', () => {
     const commits = buffer.split('\n\n').filter(Boolean);
     for (const commit of commits) {
       const decoded = decodeMessage(commit);
       console.log({
         title: decoded.title,
         trailers: decoded.trailers,
       });
     }
   });
   ```

## Node / Bash loop over `git log --pretty=raw`

1. Use `git log --pretty=raw` to include trailer lines reliably:

   ```bash
   git log --pretty=raw | node scripts/logProcessor.js
   ```

2. Example `scripts/logProcessor.js`:

   ```javascript
   import { decodeMessage, formatBodySegment } from '@git-stunts/trailer-codec';

   const reader = require('readline').createInterface({
     input: process.stdin,
   });

   let commitLines = [];

   reader.on('line', (line) => {
     if (line.startsWith('commit ')) {
       processCommit(commitLines.join('\n'));
       commitLines = [];
     }
     commitLines.push(line);
   });

   reader.on('close', () => {
     processCommit(commitLines.join('\n'));
   });

   function processCommit(raw) {
     const body = raw.split('\n\n', 2)[1] ?? '';
     if (!body.trim()) return;
     const decoded = decodeMessage(body);
     console.log(formatBodySegment(decoded.body));
   }
   ```

## Git-CMS example: filtering published posts

```javascript
import { decodeMessage } from '@git-stunts/trailer-codec';
import { execSync } from 'child_process';

const log = execSync('git log --format=%B').toString();
const commits = log.split('\n\n').filter(Boolean);

const posts = commits
  .map((commit) => decodeMessage(commit))
  .filter((decoded) => decoded.trailers.status === 'published')
  .map((decoded) => ({
    title: decoded.title,
    slug: decoded.trailers.slug,
    author: decoded.trailers['signed-off-by'],
  }));

console.table(posts);
```

For large repos, you can replace `execSync` with streaming `spawn`/`readline` to avoid buffering the whole log.
