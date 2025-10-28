'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { toPriceString } from '@/lib/currency';

export function CartDrawer() {
  const { items, subtotalCents, isOpen, closeCart, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="cart-drawer"
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
        >
          <motion.div
            className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Shopping cart</h2>
                <p className="text-sm text-muted">{items.length} item(s) ready for checkout</p>
              </div>
              <button
                onClick={closeCart}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 && (
                <p className="mt-12 text-center text-sm text-muted">Your cart is waiting to be filled.</p>
              )}

              <ul className="space-y-4" role="list">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-4 rounded-2xl border border-slate-200 p-3">
                    <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-semibold text-slate-900 hover:underline"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-xs text-muted">Quantity: {item.quantity}</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {toPriceString(item.product.priceCents * item.quantity)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="h-8 w-8 rounded-full border border-slate-200 text-sm text-muted transition hover:border-danger hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Subtotal</span>
                <span>{toPriceString(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Shipping and taxes calculated at checkout.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full" size="lg">
                    Proceed to checkout
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={closeCart}>
                  Continue shopping
                </Button>
              </div>
            </footer>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
