'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

type HeaderProps = {
  categories: Array<{ id: number; name: string; slug: string }>;
};

export function Header({ categories }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { items, toggleCart } = useCart();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            ShopVerse
          </Link>
          <form
            onSubmit={handleSearch}
            className="flex min-w-[280px] flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm focus-within:border-brand focus-within:bg-white"
            role="search"
          >
            <span className="mr-2 text-muted" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search for products, categories, or brands"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-label="Search products"
            />
            <Button type="submit" size="sm" variant="ghost" className="ml-2 text-sm">
              Search
            </Button>
          </form>
          <nav className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm font-semibold text-slate-700 md:inline">Hi, {user.name.split(' ')[0]}</span>
                <Link
                  href="/account"
                  className="hidden text-sm font-semibold text-brand hover:underline md:inline"
                >
                  Account
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-brand">
                  Sign in
                </Link>
                <Link href="/register">
                  <Button size="sm">Create account</Button>
                </Link>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleCart}
              aria-label={`Open cart with ${items.length} items`}
              className="relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.39H6" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {items.length}
                </span>
              )}
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-sm text-muted">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1 transition hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                searchParams.get('category') === category.slug && 'bg-brand/10 text-brand'
              )}
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/products"
            className="whitespace-nowrap rounded-full px-3 py-1 font-semibold text-brand hover:bg-brand/10"
          >
            Browse all
          </Link>
        </div>
      </div>
    </header>
  );
}
