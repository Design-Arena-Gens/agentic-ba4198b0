'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? 'test-paypal-client-id';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId }}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}
