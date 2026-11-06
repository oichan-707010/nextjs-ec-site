"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartItem, useCart } from "@/hooks/useCart";

type CartControlsProps = {
  cartItem: Omit<CartItem, "quantity">;
  stock: number;
  loggedIn: boolean;
};

export default function CartControls({
  cartItem,
  stock,
  loggedIn,
}: CartControlsProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(cartItem.id);

  const [quantity, setQuantity] = useState(1);

  const quantityOptions = [];
  for (let i = 1; i <= Math.min(stock, 10); i++) {
    quantityOptions.push(
      <option key={i} value={i}>
        {i}
      </option>,
    );
  }

  const handleCart = () => {
    addItem({ ...cartItem }, quantity);
  };

  const handleOrder = () => {
    if (!inCart) {
      addItem({ ...cartItem }, quantity);
    }

    router.push("/order-confirm");
  };

  return (
    <div className="space-y-6 mt-8">
      {stock > 0 && (
        <div className="flex items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="quantity" className="block text-sm text-gray-700">
              数量
            </label>
            <select
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-4 py-2 w-24 focus:ring-2 focus:ring-indigo-500"
            >
              {quantityOptions}
            </select>
          </div>

          <button
            onClick={!inCart ? handleCart : undefined}
            disabled={inCart}
            className={`py-2 px-4 rounded-sm min-w-[130px] ${inCart ? "bg-gray-400 text-white cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white"}`}
          >
            {inCart ? "追加済み" : "カートに追加"}
          </button>

          {loggedIn && (
            <button
              onClick={handleOrder}
              className="border border-indigo-500 text-indigo-500 py-2 px-4 rounded-sm hover:bg-indigo-50"
            >
              購入手続きへ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
