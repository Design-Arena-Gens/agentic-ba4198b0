import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Checkout cancelled',
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-subtle">
      <h1 className="text-3xl font-semibold text-slate-900">Payment cancelled</h1>
      <p className="mt-3 text-sm text-muted">
        Your payment was not completed. You can resume checkout or update your cart anytime.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/checkout">
          <Button size="sm">Return to checkout</Button>
        </Link>
        <Link href="/products">
          <Button size="sm" variant="ghost">
            Continue shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
