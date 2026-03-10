---
title: Node Runtime and ESM
description: Understand the runtime assumptions for this SDK before wiring it into your application.
sidebar:
  order: 3
---

## Runtime contract

- This package targets a Node.js runtime, not the browser.
- The published package is ESM-first. Use `import`, not `require`.
- The callback helper uses `node:http` primitives and is designed for Node servers or Node-compatible frameworks.

## Good fits

- Express, Fastify, Koa, Hono on Node
- Plain `node:http` servers
- Background workers, cron jobs, or queue consumers running in Node.js

## Not a fit

- Browser bundles
- Edge runtimes without full Node compatibility
- Environments where `Buffer` and Node request handlers are unavailable

## Framework note

If you already have a web framework, prefer the parsing helpers and mount them inside your existing routes. Use the standalone callback handler when you want the SDK to own the basic request parsing for a small service.
