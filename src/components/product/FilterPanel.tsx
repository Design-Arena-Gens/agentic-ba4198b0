'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Option = {
  id: number;
  name: string;
  slug: string;
};

type FilterPanelProps = {
  categories: Option[];
  brands: Option[];
};

function useQueryUpdater() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    },
    [router, searchParams, pathname]
  );
}

export function FilterPanel({ categories, brands }: FilterPanelProps) {
  const searchParams = useSearchParams();
  const updateQuery = useQueryUpdater();

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') ?? '',
    max: searchParams.get('maxPrice') ?? '',
  });

  useEffect(() => {
    setPriceRange({
      min: searchParams.get('minPrice') ?? '',
      max: searchParams.get('maxPrice') ?? '',
    });
  }, [searchParams]);

  function handleToggleFilter(key: 'category' | 'brand', value: string) {
    const current = searchParams.get(key);
    updateQuery({ [key]: current === value ? null : value, page: '1' });
  }

  function handleRatingChange(value: string) {
    updateQuery({ rating: value || null, page: '1' });
  }

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    updateQuery({ sort: event.target.value || null, page: '1' });
  }

  function applyPriceFilter(event: React.FormEvent) {
    event.preventDefault();
    updateQuery({
      minPrice: priceRange.min || null,
      maxPrice: priceRange.max || null,
      page: '1',
    });
  }

  const activeCategory = searchParams.get('category');
  const activeBrand = searchParams.get('brand');
  const activeRating = searchParams.get('rating') ?? '';
  const sort = searchParams.get('sort') ?? '';

  return (
    <aside className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
          <p className="text-sm text-muted">Discover products by vertical</p>
        </header>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleToggleFilter('category', category.slug)}
              className={cn(
                'rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                activeCategory === category.slug && 'border-brand bg-brand/10 text-brand'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Brands</h3>
          <p className="text-sm text-muted">Curated labels you can trust</p>
        </header>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => handleToggleFilter('brand', brand.slug)}
              className={cn(
                'rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                activeBrand === brand.slug && 'border-brand bg-brand/10 text-brand'
              )}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={applyPriceFilter} className="space-y-3">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Price</h3>
          <p className="text-sm text-muted">Set your desired range</p>
        </header>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Min"
            value={priceRange.min}
            onChange={(event) => setPriceRange((prev) => ({ ...prev, min: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            aria-label="Minimum price"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Max"
            value={priceRange.max}
            onChange={(event) => setPriceRange((prev) => ({ ...prev, max: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
            aria-label="Maximum price"
          />
        </div>
        <Button type="submit" size="sm" variant="outline">
          Apply range
        </Button>
      </form>

      <div className="space-y-3">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Minimum rating</h3>
        </header>
        <div className="flex flex-wrap gap-2">
          {[4.5, 4, 3, 0].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingChange(value ? String(value) : '')}
              className={cn(
                'rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                activeRating === String(value) && value !== 0 && 'border-brand bg-brand/10 text-brand',
                value === 0 && activeRating === '' && 'border-brand bg-brand/10 text-brand'
              )}
            >
              {value ? `${value}★ & up` : 'Any rating'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="sort" className="text-sm font-semibold text-slate-900">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          value={sort}
          onChange={handleSortChange}
          className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 focus:border-brand focus:outline-none"
        >
          <option value="">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating-desc">Top rated</option>
          <option value="newest">Newest arrivals</option>
        </select>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => updateQuery({
          category: null,
          brand: null,
          minPrice: null,
          maxPrice: null,
          rating: null,
          sort: null,
          page: '1',
        })}
      >
        Clear filters
      </Button>
    </aside>
  );
}
