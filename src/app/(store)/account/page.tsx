import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AccountProfileCard } from '@/components/account/AccountProfileCard';
import { AddressManager } from '@/components/account/AddressManager';
import { OrderHistory } from '@/components/account/OrderHistory';

export const metadata = {
  title: 'Your account',
};

export default async function AccountPage() {
  const session = getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      addresses: {
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
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          shippingStatus: true,
          totalCents: true,
          createdAt: true,
          shippingTrackingId: true,
          items: {
            select: {
              id: true,
              productName: true,
              productSlug: true,
              quantity: true,
              priceCents: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AccountProfileCard user={{ name: user.name, email: user.email }} />
        <AddressManager initialAddresses={user.addresses} />
      </div>
      <OrderHistory
        orders={user.orders.map((order) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
