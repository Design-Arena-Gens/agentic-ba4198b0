'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from './RatingStars';
import { toPriceString } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';

type ProductOverviewProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    rating: number;
    brand: string;
    category: string;
    inventory: number;
    image: string | null;
  };
  reviewCount: number;
  externalReviewCount: number;
};

export function ProductOverview({ product, reviewCount, externalReviewCount }: ProductOverviewProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        rating: product.rating,
        brand: product.brand,
        image: product.image,
        inventory: product.inventory,
      }, quantity);
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Badge tone="brand">{product.brand}</Badge>
          <span className="text-sm text-muted">Category: {product.category}</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <RatingStars rating={product.rating} />
          <span>{reviewCount} store reviews</span>
          <span aria-hidden>•</span>
          <span>{externalReviewCount} third-party reviews</span>
        </div>
        <p className="text-base text-slate-700">{product.description}</p>
        <p className="text-3xl font-bold text-slate-900">{toPriceString(product.priceCents)}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Inventory</span>
          <span className="font-semibold text-slate-900">{product.inventory > 0 ? `${product.inventory} available` : 'Out of stock'}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={product.inventory}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Math.min(product.inventory, Number(event.target.value))))}
            className="h-10 w-20 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={product.inventory === 0 || adding}
        >
          {adding ? 'Adding…' : 'Add to cart'}
        </Button>
        <p className="text-xs text-muted">Secure payments via Stripe and PayPal. 30-day returns on eligible items.</p>
      </div>
    </section>
  );
}
