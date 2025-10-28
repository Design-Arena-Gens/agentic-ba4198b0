import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-16 text-white shadow-subtle">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center rounded-full bg-brand/10 px-4 py-1 text-sm font-semibold text-brand">
            New season essentials
          </span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Elevate your everyday with premium products, tailored just for you.
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            Browse curated collections, enjoy effortless checkout, and track deliveries with real-time updates—all in one accessible experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <Button size="lg" variant="primary">
                Explore the catalog
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="ghost" className="text-white">
                Join ShopVerse
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-lg font-semibold text-white">Intelligent discovery</p>
            <p className="mt-1 text-sm text-slate-200">Adaptive recommendations backed by live product insights.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-lg font-semibold text-white">Trusted checkout</p>
            <p className="mt-1 text-sm text-slate-200">Secure payments with Stripe and PayPal plus shipment tracking.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-lg font-semibold text-white">Accessibility-first</p>
            <p className="mt-1 text-sm text-slate-200">Keyboard friendly navigation and compliant design tokens.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-lg font-semibold text-white">Seamless accounts</p>
            <p className="mt-1 text-sm text-slate-200">Manage addresses, order history, and saved preferences.</p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-brand/20 blur-3xl" aria-hidden />
    </section>
  );
}
