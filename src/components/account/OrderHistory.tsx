'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toPriceString } from '@/lib/currency';

type OrderItem = {
  id: number;
  productName: string;
  productSlug: string;
  quantity: number;
  priceCents: number;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  totalCents: number;
  createdAt: string;
  shippingTrackingId: string | null;
  items: OrderItem[];
};

type OrderHistoryProps = {
  orders: Order[];
};

type TrackingInfo = {
  status: string;
  summary: string;
  checkpoints: Array<{ label: string; detail: string }>;
};

export function OrderHistory({ orders }: OrderHistoryProps) {
  const [tracking, setTracking] = useState<Record<string, TrackingInfo | null>>({});
  const [loadingOrder, setLoadingOrder] = useState<string | null>(null);

  async function handleTrack(orderNumber: string) {
    setLoadingOrder(orderNumber);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderNumber }),
      });
      if (!res.ok) {
        throw new Error('Unable to fetch tracking');
      }
      const data = (await res.json()) as { progress: TrackingInfo };
      setTracking((prev) => ({ ...prev, [orderNumber]: data.progress }));
    } catch (error) {
      console.error(error);
      setTracking((prev) => ({ ...prev, [orderNumber]: null }));
    } finally {
      setLoadingOrder(null);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Order history</h2>
        <p className="text-sm text-muted">Review recent purchases and track deliveries in real time.</p>
      </header>
      <div className="space-y-4">
        {orders.length === 0 && <p className="text-sm text-muted">No orders yet. Start exploring our catalog.</p>}
        {orders.map((order) => (
          <article key={order.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span className="font-semibold text-slate-900">Order {order.orderNumber}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span className="rounded-full bg-slate-100 px-3 py-1">Order: {order.status}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Payment: {order.paymentStatus}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Shipping: {order.shippingStatus}</span>
            </div>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-slate-800">
                  <span>{item.quantity} × {item.productName}</span>
                  <span>{toPriceString(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Total: {toPriceString(order.totalCents)}</p>
              {order.shippingTrackingId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTrack(order.orderNumber)}
                  disabled={loadingOrder === order.orderNumber}
                >
                  {loadingOrder === order.orderNumber ? 'Fetching…' : 'Track shipment'}
                </Button>
              )}
            </div>
            {tracking[order.orderNumber] && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-muted">
                <p className="font-semibold text-slate-800">{tracking[order.orderNumber]?.status}</p>
                <p className="mt-1 text-sm text-muted">{tracking[order.orderNumber]?.summary}</p>
                <ul className="mt-3 space-y-1 text-xs">
                  {tracking[order.orderNumber]?.checkpoints.map((checkpoint, index) => (
                    <li key={index}>
                      <span className="font-semibold text-slate-700">{checkpoint.label}:</span> {checkpoint.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tracking[order.orderNumber] === null && (
              <p className="text-sm text-danger">Tracking information is currently unavailable.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
