import type { ApiError, InventorySnapshot, Reservation, ReserveStockRequest } from '@inventory/contracts';

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as ApiError | null;
    throw new Error(error?.message ?? `Request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  inventory: () => request<InventorySnapshot>('/inventory'),
  reserve: (input: ReserveStockRequest) => request<Reservation>('/reservations', input),
  confirm: (id: string) => request<Reservation>(`/reservations/${encodeURIComponent(id)}/confirm`, {}),
  cancel: (id: string) => request<Reservation>(`/reservations/${encodeURIComponent(id)}/cancel`, {}),
};
