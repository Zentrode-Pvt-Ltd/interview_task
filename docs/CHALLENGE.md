# Mini Inventory Reservation System

**Difficulty:** Hard · **Time:** 30 minutes · **No AI**

You're building an e-commerce backend. Customers should be able to reserve products before completing checkout. Build a small inventory reservation module using in-memory data structures.

```ts
type Product = {
  id: string;
  name: string;
  stock: number;
};

type Reservation = {
  id: string;
  productId: string;
  quantity: number;
  expiresAt: number;
  status: 'active' | 'confirmed' | 'cancelled';
};
```

## Required operations

1. `reserveStock(productId, quantity)`: reserve the requested quantity; reject quantities below one or insufficient inventory. Reservations expire after ten minutes. Multiple reservations must not oversell inventory.
2. `confirmReservation(reservationId)`: confirm an active reservation; reject expired, confirmed, or cancelled reservations.
3. `cancelReservation(reservationId)`: cancel an active reservation and restore availability. Prevent double cancellation.
4. `getAvailableStock(productId)`: return available stock, accounting for active reservations.

## Constraints and deliverables

- Use in-memory data structures; no database is required.
- Use no external libraries for inventory logic. NestJS and React are supplied application frameworks.
- Write clean, maintainable code and at least three meaningful tests.
- Explain assumptions, design decisions, and any limitations.
- Complete the supplied NestJS inventory service. The HTTP routes and React interface are already connected.
- UI changes are not required or scored in this backend-heavy exercise.

## Timing

| Time | Activity |
| --- | --- |
| 0–5 minutes | Understand requirements and design |
| 5–20 minutes | Implement functionality |
| 20–27 minutes | Tests and edge cases |
| 27–30 minutes | Explain design decisions |

Share your screen and explain decisions as you work. Ask questions when behavior is ambiguous.
