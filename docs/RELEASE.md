# Release Checklist

1. Bump the version in `package.json` (e.g., `npm version patch`) and update the `[unreleased]` section in `CHANGELOG.md` with the relevant highlights.
2. Run `npm test` (Vitest) to ensure all suites pass. No Docker guard is involved—tests run locally.
3. Commit the version bump, changelog, and any other adjustments.
4. Push the branch and open a PR (code owners expect the helper functions to work as documented).
5. Once merged, run `npm publish --access public` from the repo root. There is no guard preventing publishing.
6. Tag the release (GitHub releases pick up on the changelog entry).
7. Update downstream repos (e.g., `plumbing`, `vault`) if they rely on this package.
