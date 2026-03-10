---
title: Versioning and Compatibility
description: Compatibility guarantees for the SDK, Node runtime support, and release expectations.
sidebar:
  order: 4
---

## Runtime compatibility

- Current support floor: Node.js `20+`
- Package format: ESM

## Release model

- The repository releases from version tags matching `v*`.
- CI is expected to pass lint, typecheck, test, library build, docs build, and public type smoke checks before release.

## Upgrade expectation

- New endpoint additions should be minor releases unless they require breaking config or type changes.
- Runtime floor changes, renamed public types, or removed exports should be treated as breaking changes.
