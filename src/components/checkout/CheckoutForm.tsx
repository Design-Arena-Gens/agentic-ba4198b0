'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/Button';
import { toPriceString } from '@/lib/currency';

type Address = {
  id: number;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

type CheckoutItem = {
  productId: number;
  name: string;
  slug: string;
  quantity: number;
  priceCents: number;
  image: string | null;
  brand: string;
  inventory: number;
};

type Summary = {
  subtotalCents: number;
  taxCents: number;
  shippingCostCents: number;
  totalCents: number;
};

type CheckoutFormProps = {
  addresses: Address[];
  cartItems: CheckoutItem[];
  summary: Summary;
};

type PaymentMethod = 'stripe' | 'paypal' | 'cod';

export function CheckoutForm({ addresses, cartItems, summary }: CheckoutFormProps) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    addresses.find((address) => address.isDefault)?.id ?? null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    label: 'New address',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const cartPayload = useMemo(
    () => cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [cartItems]
  );

  const requiresAddressDetails = selectedAddressId === null;

  async function submitOrder(method: PaymentMethod) {
    setLoading(true);
    setMessage(null);
    if (requiresAddressDetails) {
      const requiredFields: Array<keyof typeof shippingAddress> = [
        'fullName',
        'line1',
        'city',
        'state',
        'postalCode',
        'country',
      ];
      for (const field of requiredFields) {
        const value = shippingAddress[field] as string;
        if (!value || value.trim() === '') {
          setMessage('Please complete all required shipping address fields.');
          setLoading(false);
          return;
        }
      }
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          addressId: selectedAddressId ?? undefined,
          shippingAddress: requiresAddressDetails ? shippingAddress : undefined,
          paymentMethod: method,
          cartItems: cartPayload,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Checkout failed');
      }

      const data = await res.json();
      if (data.payment?.provider === 'stripe' && data.payment.url) {
        window.location.href = data.payment.url;
        return;
      }

      if (method === 'cod') {
        setMessage('Order confirmed! You can track progress from your account dashboard.');
        setTimeout(() => router.push('/account'), 1200);
        return;
      }

      if (method === 'paypal') {
        setMessage('Payment confirmed via PayPal. Order placed successfully.');
        setTimeout(() => router.push('/account'), 1200);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to complete checkout');
    } finally {
      setLoading(false);
    }
  }

  function renderAddressCard(address: Address) {
    return (
      <label
        key={address.id}
        className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition focus-within:border-brand focus-within:ring-2 ${
          selectedAddressId === address.id ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {address.label ? `${address.label} • ` : ''}
              {address.fullName}
            </p>
            <p className="text-xs text-muted">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
            </p>
            <p className="text-xs text-muted">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="text-xs text-muted">{address.country}</p>
          </div>
          <input
            type="radio"
            name="shipping-address"
            value={address.id}
            checked={selectedAddressId === address.id}
            onChange={() => setSelectedAddressId(address.id)}
          />
        </div>
      </label>
    );
  }

  const paymentOptions: Array<{ value: PaymentMethod; label: string; description: string }> = [
    { value: 'stripe', label: 'Stripe', description: 'Pay securely with credit or debit cards.' },
    { value: 'paypal', label: 'PayPal', description: 'Checkout via your PayPal wallet.' },
    { value: 'cod', label: 'Cash on delivery', description: 'Pay upon receiving your items.' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-xl font-semibold text-slate-900">Shipping address</h2>
            <p className="text-sm text-muted">Choose a saved address or provide new delivery details.</p>
          </header>
          <div className="grid gap-3">
            {addresses.map(renderAddressCard)}
            <label
              className={`flex cursor-pointer flex-col rounded-2xl border border-dashed p-4 text-sm ${
                requiresAddressDetails ? 'border-brand bg-brand/5' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Use a new address</span>
                <input
                  type="radio"
                  name="shipping-address"
                  value="new"
                  checked={requiresAddressDetails}
                  onChange={() => setSelectedAddressId(null)}
                />
              </div>
            </label>
            {requiresAddressDetails && (
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full name"
                  value={shippingAddress.fullName}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Address line 1"
                  value={shippingAddress.line1}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, line1: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Address line 2"
                  value={shippingAddress.line2}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, line2: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, city: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, state: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Postal code"
                  value={shippingAddress.postalCode}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, postalCode: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={shippingAddress.country}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, country: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={shippingAddress.phone}
                  onChange={(event) => setShippingAddress((prev) => ({ ...prev, phone: event.target.value }))}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-xl font-semibold text-slate-900">Payment</h2>
            <p className="text-sm text-muted">Choose a secure payment method.</p>
          </header>
          <div className="grid gap-3">
            {paymentOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                  paymentMethod === option.value ? 'border-brand bg-brand/5' : 'border-slate-200'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{option.label}</p>
                  <p className="text-xs text-muted">{option.description}</p>
                </div>
                <input
                  type="radio"
                  name="payment-method"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                />
              </label>
            ))}
          </div>
          {paymentMethod === 'stripe' && (
            <p className="text-xs text-muted">
              You’ll be redirected to Stripe to securely complete your payment.
            </p>
          )}
          {paymentMethod === 'cod' && (
            <p className="text-xs text-muted">Please prepare exact change upon delivery.</p>
          )}
          {paymentMethod === 'paypal' && (
            <p className="text-xs text-muted">
              Complete your purchase with your PayPal account. After payment, we’ll confirm your order automatically.
            </p>
          )}
        </section>

        {paymentMethod !== 'paypal' && (
          <Button
            size="lg"
            onClick={() => submitOrder(paymentMethod)}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? 'Processing…' : 'Complete order'}
          </Button>
        )}

        {paymentMethod === 'paypal' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <PayPalButtons
              style={{ layout: 'vertical' }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      amount: {
                        currency_code: 'USD',
                        value: (summary.totalCents / 100).toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={async (_data, actions) => {
                await actions.order?.capture();
                await submitOrder('paypal');
              }}
            />
          </div>
        )}

        {message && <p className="text-sm text-muted">{message}</p>}
      </div>

      <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
        <ul className="space-y-3 text-sm text-slate-700">
          {cartItems.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name}
                <span className="text-xs text-muted"> × {item.quantity}</span>
              </span>
              <span>{toPriceString(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{toPriceString(summary.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{toPriceString(summary.taxCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{toPriceString(summary.shippingCostCents)}</span>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{toPriceString(summary.totalCents)}</span>
        </div>
        <p className="text-xs text-muted">Prices in USD. Inclusive of applicable taxes.</p>
      </aside>
    </div>
  );
}
