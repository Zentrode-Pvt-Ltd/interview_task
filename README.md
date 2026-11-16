# Mini Inventory Reservation System

A candidate starter for a 30-minute backend coding challenge. NestJS, React, HTTP routes, sample products, shared types, and test runners are already set up. The inventory feature is intentionally unimplemented.

Read [the challenge brief](docs/CHALLENGE.md) before starting.

## Setup

Use Node 24 LTS and npm 11.

```sh
nvm use
npm ci
npm run dev
```

- React workspace: **http://localhost:5173**
- NestJS API: **http://localhost:3000/api**
- Health check: **http://localhost:3000/api/health**

The React interface is supplied for trying your implementation. You do not need to build the UI or configure the frameworks. Vite forwards `/api` requests to NestJS.

The four inventory operations initially return HTTP **501 Not Implemented**. The dashboard will show that message until inventory reads have been implemented. This is expected; use the health check to verify that the API is running.

## Your task

Complete the four operations in `apps/api/src/inventory/inventory.service.ts`, following the challenge brief, and write at least three meaningful tests. You may adjust the supplied structure as needed. There are no implementation hints or TODO comments in the source.

The service includes seeded in-memory product storage, empty reservation storage, and a presentation adapter (`snapshot`) for the supplied dashboard. The controllers and React interface are already connected to the service methods. HTTP request shape checks are supplied; business rules belong to your implementation.

## Commands

```sh
npm run dev          # Start both applications
npm test             # Run API and React tests
npm run typecheck    # Check both workspaces
npm run build        # Build both applications
```

The supplied tests only check application setup. They do not implement or verify the required inventory behavior and do not count toward your three feature tests. API tests use Node's built-in test runner; React tests use Vitest. Place API tests under `apps/api/src/tests/` with filenames ending in `.test.ts`.

## Structure

| Location | Purpose |
| --- | --- |
| `apps/api/src/inventory/inventory.service.ts` | Inventory operations to complete |
| `apps/api/src/inventory/products.ts` | Sample products |
| `apps/api/src/inventory/inventory.controller.ts` | Supplied HTTP routes |
| `apps/api/src/tests/` | API tests |
| `apps/web` | Supplied React interface |
| `packages/contracts/src/index.ts` | Shared product, reservation, and response types |
| `docs/CHALLENGE.md` | Requirements and interview timing |

## HTTP interface

All paths are relative to `/api`.

| Method | Path | Input |
| --- | --- | --- |
| GET | `/health` | None |
| GET | `/inventory` | None; dashboard snapshot |
| GET | `/products` | None |
| GET | `/products/:id/stock` | Product ID |
| GET | `/reservations` | None |
| POST | `/reservations` | JSON: `{ "productId": "prod-monitor", "quantity": 1 }` |
| POST | `/reservations/:id/confirm` | Reservation ID |
| POST | `/reservations/:id/cancel` | Reservation ID |

The frontend displays API error messages. All tabs use the same in-memory backend; restarting the API clears its data. No database or environment file is required.
