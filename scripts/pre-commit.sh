#!/usr/bin/env bash
set -euo pipefail

# Run the fast checks we care about before committing.
npm run lint
npm run format
