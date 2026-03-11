# Contributing to PesaKit

Thanks for contributing. This repository is an open source Node.js SDK for Safaricom M-Pesa Daraja APIs, so changes should optimize for correctness, clarity, and maintainability over clever abstractions.

## Before you start

- Runtime floor: Node.js `20+`
- Package manager: Yarn classic (`yarn`)
- Package format: ESM
- Quality bar: every public behavior change needs tests and docs

## Local setup

```bash
git clone https://github.com/landelatech/mpesa-node.git
cd mpesa-node
yarn install
```

## Daily commands

| Command                 | What it does                                                  |
| ----------------------- | ------------------------------------------------------------- |
| `yarn test`             | Runs the Vitest suite                                         |
| `yarn coverage`         | Runs tests with V8 coverage reporting                         |
| `yarn lint`             | Lints source, tests, examples, config, and docs support files |
| `yarn typecheck`        | Type-checks the TypeScript source                             |
| `yarn build`            | Builds the published SDK                                      |
| `yarn docs:dev`         | Starts the Starlight docs site locally                        |
| `yarn docs:build`       | Builds the docs site                                          |
| `yarn typecheck:public` | Checks the generated public declarations                      |
| `yarn ci:check`         | Runs the SDK quality gate used across the Node support matrix |

## What a good pull request includes

- One focused change set with a clear problem statement
- Tests for runtime behavior and, when relevant, public type behavior
- Docs updates when public API, examples, or operational guidance change
- No real credentials, `.env` files, or copied portal secrets

## Adding or changing an API surface

1. Add or update request/response types.
2. Implement the module behavior with validation and typed errors.
3. Wire the module into the `Mpesa` client and root exports.
4. Add request-shape and validation tests.
5. Update the docs site and examples.

## Documentation workflow

- Long-form docs live in `docs/`.
- The root `README.md` stays short and package-focused.
- If you change SDK behavior, update the relevant docs page in the same pull request.

## Daraja implementation expectations

- Stay close to current Daraja field names and behavior.
- Prefer explicit validation errors over hidden fallbacks.
- Treat asynchronous callbacks as the final source of truth for async APIs.
- Call out any portal ambiguities in the PR description when the official docs are inconsistent or incomplete.

## Release notes for contributors

- Releases are cut from tags matching `v*`.
- Maintainers handle versioning and publish steps.
- If your change is breaking, call it out explicitly in the PR summary.

## Need help?

- Open a draft PR early if you want design feedback.
- Use issues for bugs, missing endpoint requests, and docs gaps.
