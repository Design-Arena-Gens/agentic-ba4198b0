'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { RatingStars } from './RatingStars';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { toPriceString } from '@/lib/currency';

export type ProductCardProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    priceCents: number;
    rating: number;
    brand: string;
    image: string | null;
    inventory: number;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
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
      });
    } finally {
      setAdding(false);
    }
  }

  return (
    <motion.article
      className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-subtle"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-slate-100">
        <div className="aspect-[4/5] w-full overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-200 text-muted">Image unavailable</div>
          )}
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {product.brand}
        </span>
      </Link>
      <div className="mt-4 flex flex-col gap-2">
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-lg font-semibold text-slate-900">
          {product.name}
        </Link>
        <RatingStars rating={product.rating} size="sm" />
        <p className="text-xl font-bold text-slate-900">{toPriceString(product.priceCents)}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-xs text-muted">
          {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
        </span>
        <Button
          size="sm"
          variant="primary"
          disabled={product.inventory === 0 || adding}
          onClick={handleAddToCart}
        >
          {adding ? 'Adding…' : 'Add to cart'}
        </Button>
      </div>
    </motion.article>
  );
}
