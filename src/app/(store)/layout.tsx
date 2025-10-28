import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((mod) => ({ default: mod.CartDrawer })),
  { ssr: false }
);

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-surface">
      <Suspense fallback={<div className="border-b border-slate-200 bg-white px-6 py-4 text-sm text-muted">Loading navigation…</div>}>
        <Header categories={categories} />
      </Suspense>
      <CartDrawer />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}
