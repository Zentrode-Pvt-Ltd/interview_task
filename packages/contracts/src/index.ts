export type Product = { id: string; name: string; stock: number };
export type Reservation = {
  id: string;
  productId: string;
  quantity: number;
  expiresAt: number;
  status: 'active' | 'confirmed' | 'cancelled';
};
export type ProductView = Product & { availableStock: number; reservedStock: number };
export type InventorySnapshot = {
  products: ProductView[];
  reservations: Reservation[];
  serverTime: number;
};
export type ReserveStockRequest = { productId: string; quantity: number };
export type ApiError = { statusCode: number; message: string; error?: string };
