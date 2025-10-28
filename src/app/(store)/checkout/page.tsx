import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

const TAX_RATE = 0.085;
const SHIPPING_FLAT_CENTS = 1299;

export const metadata = {
  title: 'Checkout',
};

export default async function CheckoutPage() {
  const session = getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const [addresses, cartItems] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        label: true,
        fullName: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
      },
    }),
    prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            brand: true,
          },
        },
      },
    }),
  ]);

  if (cartItems.length === 0) {
    redirect('/products');
  }

  const items = cartItems.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    slug: item.product.slug,
    quantity: item.quantity,
    priceCents: item.product.priceCents,
    image: item.product.images[0]?.url ?? null,
    brand: item.product.brand.name,
    inventory: item.product.inventory,
  }));

  const subtotalCents = items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents + SHIPPING_FLAT_CENTS;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
        <p className="text-sm text-muted">Confirm your shipping details and select a secure payment method.</p>
      </header>
      <CheckoutForm
        addresses={addresses}
        cartItems={items}
        summary={{
          subtotalCents,
          taxCents,
          shippingCostCents: SHIPPING_FLAT_CENTS,
          totalCents,
        }}
      />
    </div>
  );
}
