import { Injectable, NotImplementedException } from '@nestjs/common';
import type { InventorySnapshot, Product, Reservation } from '@inventory/contracts';
import { SEED_PRODUCTS } from './products';

@Injectable()
export class InventoryService {
  private readonly products = new Map<string, Product>(
    SEED_PRODUCTS.map((product) => [product.id, { ...product }]),
  );
  private readonly reservations = new Map<string, Reservation>();

  reserveStock(productId: string, quantity: number): Reservation {
    throw new NotImplementedException();
  }

  confirmReservation(reservationId: string): Reservation {
    throw new NotImplementedException();
  }

  cancelReservation(reservationId: string): Reservation {
    throw new NotImplementedException();
  }

  getAvailableStock(productId: string): number {
    throw new NotImplementedException();
  }

  snapshot(): InventorySnapshot {
    return {
      products: [...this.products.values()].map((product) => {
        const availableStock = this.getAvailableStock(product.id);
        return { ...product, availableStock, reservedStock: product.stock - availableStock };
      }),
      reservations: [...this.reservations.values()].map((reservation) => ({ ...reservation })).reverse(),
      serverTime: Date.now(),
    };
  }
}
