'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = 'shopverse_guest_cart_v1';

type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  rating: number;
  brand: string;
  image: string | null;
  inventory: number;
};

type CartItem = {
  id?: number;
  quantity: number;
  product: ProductSummary;
};

type CartContextValue = {
  items: CartItem[];
  subtotalCents: number;
  isOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: ProductSummary, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch cart');
  }
  return res.json();
};

type ServerCartResponse = {
  items: Array<{
    id: number;
    quantity: number;
    product: ProductSummary;
  }>;
  subtotalCents: number;
};

function loadGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as CartItem[];
    return parsed;
  } catch (error) {
    console.error('Failed to parse cart from storage', error);
    return [];
  }
}

function persistGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);

  const { data: cartData, isLoading, mutate } = useSWR<ServerCartResponse>(
    user ? '/api/cart' : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (!user) {
      setGuestItems(loadGuestCart());
    } else {
      setGuestItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      persistGuestCart(guestItems);
    }
  }, [guestItems, user]);

  const items = useMemo(() => {
    if (user) {
      return (
        cartData?.items?.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: item.product,
        })) ?? []
      );
    }
    return guestItems;
  }, [user, cartData, guestItems]);

  const subtotalCents = useMemo(
    () => items.reduce((acc, item) => acc + item.product.priceCents * item.quantity, 0),
    [items]
  );

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  function toggleCart() {
    setIsOpen((prev) => !prev);
  }

  async function addToCart(product: ProductSummary, quantity = 1) {
    if (user) {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Unable to add to cart');
      }
      await mutate();
    } else {
      setGuestItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          const newQuantity = Math.min(product.inventory, existing.quantity + quantity);
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: newQuantity } : item
          );
        }
        return [...prev, { product, quantity: Math.min(quantity, product.inventory) }];
      });
    }
  }

  async function updateItem(productId: number, quantity: number) {
    if (user) {
      const item = cartData?.items.find((entry) => entry.product.id === productId);
      if (!item) return;
      const res = await fetch(`/api/cart/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Unable to update cart item');
      }
      await mutate();
    } else {
      setGuestItems((prev) =>
        prev
          .map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.min(quantity, item.product.inventory) }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    }
  }

  async function removeItem(productId: number) {
    if (user) {
      const item = cartData?.items.find((entry) => entry.product.id === productId);
      if (!item) return;
      await fetch(`/api/cart/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      await mutate();
    } else {
      setGuestItems((prev) => prev.filter((item) => item.product.id !== productId));
    }
  }

  async function clearCart() {
    if (user) {
      const currentItems = cartData?.items ?? [];
      await Promise.all(
        currentItems.map((item) =>
          fetch(`/api/cart/${item.id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );
      await mutate();
    } else {
      setGuestItems([]);
    }
  }

  const value: CartContextValue = {
    items,
    subtotalCents,
    isOpen,
    loading: isLoading,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
