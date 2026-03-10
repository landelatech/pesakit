---
title: Contributing
description: Start contributing to the SDK, docs, tests, or examples without guessing the local workflow.
sidebar:
  order: 1
---

## First-time contributor path

1. Fork the repository and create a branch from `main`.
2. Install dependencies with Yarn classic.
3. Run `yarn ci:check` before you open a pull request.
4. Add or update tests for behavior changes.
5. Update the docs when public behavior changes.

## Areas that welcome contributions

- New endpoint support with tests and docs
- Error handling and validation improvements
- Callback examples and troubleshooting guides
- Contributor experience fixes in CI, docs, and repo templates

## Local commands

```bash
yarn install
yarn docs:dev
yarn ci:check
```

## More detail

The root repository guide in [`CONTRIBUTING.md`](https://github.com/landelatech/mpesa-node/blob/main/CONTRIBUTING.md) is the maintainers’ source of truth for pull request expectations, release assumptions, and repository policies.
