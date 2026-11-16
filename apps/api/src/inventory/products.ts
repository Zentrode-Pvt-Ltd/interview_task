import type { Product } from '@inventory/contracts';

export const SEED_PRODUCTS: readonly Product[] = [
  { id: 'prod-keyboard', name: 'Mechanical Keyboard', stock: 12 },
  { id: 'prod-headphones', name: 'Studio Headphones', stock: 8 },
  { id: 'prod-mouse', name: 'Wireless Mouse', stock: 20 },
  { id: 'prod-monitor', name: '4K Monitor', stock: 3 },
];
