import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Order confirmed',
};

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-subtle">
      <h1 className="text-3xl font-semibold text-slate-900">Thank you for your purchase!</h1>
      <p className="mt-3 text-sm text-muted">
        {orderNumber
          ? `Order ${orderNumber} is confirmed. A receipt has been sent to your email.`
          : 'Your order is confirmed. A receipt has been sent to your email.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/account">
          <Button size="sm">View orders</Button>
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
