# Testing & Developer Validation

This file describes how to exercise the validation, lint, and format tooling that backs `@git-stunts/trailer-codec` so you can ship documentation or code changes with confidence.

## Prerequisites

- Node.js **20.x** (per `package.json` `engines`) so Vitest, ESLint, and the ESM modules run without warnings.
- Run `npm install` once after cloning to populate `node_modules`.

## Running the suites

| Script | Description |
| --- | --- |
| `npm test` | Runs **Vitest** over `test/unit`. Pass additional arguments (e.g., `npm test -- test/unit/domain/services/TrailerCodecService.test.js`) to limit which files execute, and append `--runInBand` or `--no-color` to `npm test --` for sequential execution or colorless logs (e.g., `npm test -- --runInBand` or `npm test -- --no-color`). |
| `npm run lint` | Executes **ESLint** across the entire repository. Fix any reported issues locally. |
| `npm run format` | Runs **Prettier** with the configured settings to keep formatting consistent. Commit the formatted files or run with `--check` before publishing documentation. |

Use `npm test -- --watch` to run Vitest in watch mode while you iterate.

## Extending tests

- Add unit files under `test/unit/` following the existing structure (mirrors `src/`).
- Mock dependencies with Vitest helpers (`vi.fn`, `vi.mock`) when you do not need to exercise the real parser/service.
- Update snapshots, if any, by running `npm test -- -u` inside the relevant suite.

## Troubleshooting

- If the suite fails due to missing modules, delete `node_modules` and rerun `npm install`.
- ESLint/Prettier share the `.eslintrc.js`/`.prettierrc` configurations; run `npm run lint` first to enforce syntax, then `npm run format` to correct formatting drift.
