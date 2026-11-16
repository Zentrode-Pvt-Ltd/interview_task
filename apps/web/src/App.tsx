import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { InventorySnapshot, ProductView, Reservation } from '@inventory/contracts';
import { api } from './api';

function remaining(expiresAt: number, now: number) {
  const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function ProductCard({ product, busy, onReserve }: {
  product: ProductView; busy: boolean; onReserve: (productId: string, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState('1');
  const valid = Number.isSafeInteger(Number(quantity)) && Number(quantity) >= 1 && Number(quantity) <= product.availableStock;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid) onReserve(product.id, Number(quantity));
  }
  return <article className="product-card">
    <div className="product-top"><span className="product-icon" aria-hidden="true">{product.name.split(' ').map((word) => word[0]).join('')}</span>
      <span className={`badge ${product.availableStock === 0 ? 'cancelled' : product.availableStock <= 3 ? 'low' : 'available'}`}>
        {product.availableStock === 0 ? 'Out of stock' : product.availableStock <= 3 ? 'Low stock' : 'In stock'}
      </span>
    </div>
    <h3>{product.name}</h3><p className="product-id">{product.id}</p>
    <div className="stock-number">{product.availableStock}<span>available</span></div>
    <div className="stock-track"><span style={{ width: `${product.stock ? product.availableStock / product.stock * 100 : 0}%` }} /></div>
    <div className="stock-detail"><span>{product.reservedStock} reserved</span><span>{product.stock} remaining</span></div>
    <form onSubmit={submit} className="reserve-form">
      <label className="sr-only" htmlFor={`qty-${product.id}`}>Quantity for {product.name}</label>
      <input id={`qty-${product.id}`} type="number" min="1" max={product.availableStock || 1} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={busy || !product.availableStock} />
      <button className="primary" disabled={busy || !valid} type="submit">Reserve stock <span aria-hidden="true">↗</span></button>
    </form>
  </article>;
}

export function App() {
  const [snapshot, setSnapshot] = useState<InventorySnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0);
  const requestId = useRef(0);
  const mounted = useRef(false);
  const mutationPending = useRef(false);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    const data = await api.inventory();
    if (mounted.current && id === requestId.current) {
      offset.current = data.serverTime - Date.now();
      setNow(data.serverTime);
      setSnapshot(data);
      setError('');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const load = () => {
      if (!mutationPending.current) void refresh().catch((cause: unknown) => {
        if (mounted.current) setError(cause instanceof Error ? cause.message : 'Unable to load inventory.');
      });
    };
    load();
    const polling = window.setInterval(load, 5000);
    const timer = window.setInterval(() => setNow(Date.now() + offset.current), 1000);
    return () => { mounted.current = false; ++requestId.current; clearInterval(polling); clearInterval(timer); };
  }, [refresh]);

  async function mutate(action: () => Promise<unknown>, message: string) {
    if (mutationPending.current) return;
    mutationPending.current = true;
    ++requestId.current;
    setBusy(true); setError(''); setNotice('');
    try {
      await action();
      setNotice(message);
      try { await refresh(); } catch { setError('Change saved, but inventory could not refresh. Please retry.'); }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.');
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  }

  function status(reservation: Reservation) {
    return reservation.status === 'active' && (reservation.expiresAt <= now) ? 'expired' : reservation.status;
  }
  const reservations = snapshot?.reservations ?? [];
  const active = reservations.filter((reservation) => status(reservation) === 'active');
  const visible = reservations.filter((reservation) => filter === 'all' || status(reservation) === filter);
  const available = snapshot?.products.reduce((total, product) => total + product.availableStock, 0) ?? 0;
  const confirmed = reservations.filter((reservation) => reservation.status === 'confirmed').length;

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Stockroom home"><span className="brand-mark" aria-hidden="true">▦</span> stockroom<span className="brand-dot">.</span></a>
      <span className="workspace-label">Inventory workspace</span><span className="environment">LOCAL DEMO</span></header>
    <main>
      <div className="page-heading"><div><div className="eyebrow">OPERATIONS / INVENTORY</div><h1>Every item, accounted for<span>.</span></h1><p>Reserve with confidence. Keep your inventory in sync.</p></div>
        <button className="secondary refresh" disabled={busy} onClick={() => void refresh().catch(() => setError('Unable to refresh inventory.'))}>↻ <span>Refresh inventory</span></button>
      </div>
      {error && <div role="alert" className="message error">{error}</div>}
      {notice && <div role="status" className="message success">{notice}</div>}
      <section className="metrics" aria-label="Inventory summary">
        <div className="metric"><span>Available units</span><strong>{snapshot ? available : '—'}</strong><small>Ready to reserve</small></div>
        <div className="metric"><span>Active reservations</span><strong>{snapshot ? active.length : '—'}</strong><small>Held for up to 10 minutes</small></div>
        <div className="metric"><span>Confirmed reservations</span><strong>{snapshot ? confirmed : '—'}</strong><small>Successfully checked out</small></div>
        <div className="metric accent"><span>Reservation window</span><strong>10<span>min</span></strong><small>Stock releases automatically on expiry</small></div>
      </section>
      <section aria-labelledby="products-heading">
        <div className="section-heading"><div><h2 id="products-heading">Product inventory <span className="count">{snapshot?.products.length ?? 0}</span></h2><p>Select a quantity to create a reservation.</p></div><span className="live-label"><i /> Refreshes every 5s</span></div>
        {!snapshot ? <div className="empty">{error ? 'Inventory is unavailable. Use Refresh inventory to retry.' : 'Loading inventory…'}</div> : <div className="products">{snapshot.products.map((product) => <ProductCard key={product.id} product={product} busy={busy} onReserve={(productId, quantity) => void mutate(() => api.reserve({ productId, quantity }), 'Stock reserved. Confirm checkout within 10 minutes.')} />)}</div>}
      </section>
      <section className="reservations-section" aria-labelledby="reservations-heading">
        <div className="section-heading"><div><h2 id="reservations-heading">Reservations <span className="count">{reservations.length}</span></h2><p>A live view of every hold and checkout.</p></div>
          <label className="filter-label">Show <select aria-label="Filter reservations" value={filter} onChange={(event) => setFilter(event.target.value)}>{['all', 'active', 'confirmed', 'cancelled', 'expired'].map((value) => <option key={value} value={value}>{value === 'all' ? 'All statuses' : value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
        </div>
        <div className="table-container"><table><thead><tr><th>Product / reservation</th><th>Quantity</th><th>Status</th><th>Time remaining</th><th className="actions-heading">Actions</th></tr></thead>
          <tbody>{visible.map((reservation) => {
            const currentStatus = status(reservation);
            return <tr key={reservation.id}><td><strong>{snapshot?.products.find((product) => product.id === reservation.productId)?.name ?? reservation.productId}</strong><code title={reservation.id}>{reservation.id.slice(0, 8)}</code></td>
              <td>{reservation.quantity} <span className="muted">{reservation.quantity === 1 ? 'unit' : 'units'}</span></td><td><span className={`badge ${currentStatus}`}>{currentStatus}</span></td>
              <td><span className={currentStatus === 'active' ? 'countdown' : 'muted'}>{currentStatus === 'active' ? remaining(reservation.expiresAt, now) : '—'}</span></td>
              <td className="row-actions">{currentStatus === 'active' ? <><button disabled={busy} className="confirm" onClick={() => void mutate(() => api.confirm(reservation.id), 'Reservation confirmed. Stock has been checked out.')}>Confirm</button><button disabled={busy} className="cancel" onClick={() => void mutate(() => api.cancel(reservation.id), 'Reservation cancelled. Stock is available again.')}>Cancel</button></> : <span className="muted">Completed</span>}</td>
            </tr>;
          })}</tbody></table>
          {visible.length === 0 && <div className="empty"><span className="empty-icon" aria-hidden="true">▤</span><h3>{filter === 'all' ? 'Your reservations will appear here' : `No ${filter} reservations`}</h3><p>Reserve a product above to start the checkout flow.</p></div>}
        </div>
      </section>
      <footer><span><span className="footer-symbol" aria-hidden="true">◇</span> In-memory workspace · Restarting the API clears all data.</span><span>Built for the inventory challenge</span></footer>
    </main>
  </div>;
}
