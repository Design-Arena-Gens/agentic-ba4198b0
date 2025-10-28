'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';

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

type AddressManagerProps = {
  initialAddresses: Address[];
};

const emptyAddress: Address = {
  id: 0,
  label: '',
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  isDefault: false,
};

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Address>(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setFormData(emptyAddress);
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          label: formData.label,
          fullName: formData.fullName,
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          isDefault: formData.isDefault,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Failed to save address');
      }
      const { address } = await res.json();
      setAddresses((prev) => (address.isDefault ? [address, ...prev.map((a) => ({ ...a, isDefault: false }))] : [...prev, address]));
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE', credentials: 'include' });
    setAddresses((prev) => prev.filter((address) => address.id !== id));
  }

  async function handleMakeDefault(id: number) {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isDefault: true }),
    });
    setAddresses((prev) =>
      prev.map((address) => ({ ...address, isDefault: address.id === id }))
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Saved addresses</h2>
          <p className="text-sm text-muted">Use quick actions for checkout and order tracking.</p>
        </div>
        <Button variant={showForm ? 'ghost' : 'outline'} size="sm" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'Add address'}
        </Button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Label (e.g., Home)"
              value={formData.label ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, label: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="Full name"
              required
              value={formData.fullName}
              onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="Address line 1"
              required
              value={formData.line1}
              onChange={(event) => setFormData((prev) => ({ ...prev, line1: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="Address line 2"
              value={formData.line2 ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, line2: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="City"
              required
              value={formData.city}
              onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="State / Province"
              required
              value={formData.state}
              onChange={(event) => setFormData((prev) => ({ ...prev, state: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="Postal code"
              required
              value={formData.postalCode}
              onChange={(event) => setFormData((prev) => ({ ...prev, postalCode: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="Country"
              required
              value={formData.country}
              onChange={(event) => setFormData((prev) => ({ ...prev, country: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(event) => setFormData((prev) => ({ ...prev, isDefault: event.target.checked }))}
              />
              Set as default address
            </label>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? 'Saving…' : 'Save address'}
          </Button>
        </form>
      )}

      <ul className="space-y-3" role="list">
        {addresses.map((address) => (
          <li key={address.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {address.label ? `${address.label} • ` : ''}
                  {address.fullName}
                </p>
                <p className="text-sm text-muted">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                </p>
                <p className="text-sm text-muted">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-muted">{address.country}</p>
                {address.phone && <p className="text-sm text-muted">{address.phone}</p>}
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                {address.isDefault && <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">Default</span>}
                {!address.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => handleMakeDefault(address.id)}>
                    Make default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)}>
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {addresses.length === 0 && <p className="text-sm text-muted">No addresses saved yet.</p>}
    </section>
  );
}
