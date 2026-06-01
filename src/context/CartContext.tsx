"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types/restaurant';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('taitai-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const validCart = Array.isArray(parsedCart)
          ? parsedCart.filter((item) => typeof item.id === "string" && uuidPattern.test(item.id))
          : [];

        if (validCart.length !== parsedCart.length) {
          localStorage.setItem("taitai-cart", JSON.stringify(validCart));
        }

        setCart(validCart);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('taitai-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: any) => {
    if ((item.stock_quantity ?? Infinity) <= 0) {
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= (item.stock_quantity ?? Infinity)) {
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: Math.min(item.stock_quantity ?? Infinity, Math.max(1, item.quantity + delta)),
        };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('taitai-cart');
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
