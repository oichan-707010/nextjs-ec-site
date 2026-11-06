"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  createContext,
} from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, addQuantity?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  isInCart: (id: string) => boolean;
  totalPrice: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "cartItems";

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartはCartProviderの内部でのみ使用してください。");
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (err) {
      console.error("カート読み込みエラー：", err);
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("カート保存エラー：", err);
    }
  }, [cartItems]);

  const addItem = useCallback(
    (targetProduct: Omit<CartItem, "quantity">, addQuantity = 1) => {
      setCartItems((prevCart) => {
        const isInCart = prevCart.find((item) => item.id === targetProduct.id);
        if (isInCart) {
          return prevCart.map((item) =>
            item.id === targetProduct.id
              ? { ...item, quantity: item.quantity + addQuantity }
              : item,
          );
        } else {
          return [...prevCart, { ...targetProduct, quantity: addQuantity }];
        }
      });
    },
    [],
  );

  const removeItem = useCallback((targetId: string) => {
    setCartItems((prevCart) => prevCart.filter((p) => p.id !== targetId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const updateQuantity = useCallback(
    (targetId: string, newQuantity: number) => {
      setCartItems((prevCart) => {
        if (newQuantity > 0) {
          return prevCart.map((item) =>
            item.id === targetId ? { ...item, quantity: newQuantity } : item,
          );
        } else {
          return prevCart.filter((item) => item.id !== targetId);
        }
      });
    },
    [],
  );

  const isInCart = useCallback(
    (targetId: string) => {
      return cartItems.some((p) => p.id === targetId);
    },
    [cartItems],
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        clearCart,
        updateQuantity,
        isInCart,
        totalPrice,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
