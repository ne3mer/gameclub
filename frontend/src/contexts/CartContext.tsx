'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api';

type CartItem = {
  gameId: {
    id: string;
    title: string;
    slug: string;
    coverUrl?: string;
    basePrice: number;
  };
  quantity: number;
  priceAtAdd: number;
  addedAt: string;
  variantId?: string;
  selectedOptions?: Record<string, string>;
};

type Cart = {
  id?: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
};

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string;
  itemCount: number;
  totalPrice: number;
  addToCart: (gameId: string, quantity?: number, variantId?: string, selectedOptions?: Record<string, string>) => Promise<void>;
  updateQuantity: (gameId: string, quantity: number) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gc_token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  const refreshCart = async () => {
    const token = getAuthToken();
    if (!token) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (gameId: string, quantity: number = 1, variantId?: string, selectedOptions?: Record<string, string>) => {
    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ gameId, quantity, variantId, selectedOptions })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطا در افزودن به سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در افزودن به سبد خرید';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (gameId: string, quantity: number) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/cart/${gameId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در بروزرسانی';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (gameId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/cart/${gameId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('خطا در حذف از سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در حذف';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('خطا در پاک کردن سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در پاک کردن سبد';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when user logs in
  useEffect(() => {
    refreshCart();
  }, []);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0;

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
