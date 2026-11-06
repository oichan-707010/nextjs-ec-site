"use client";

import { useState } from "react";

type FavoriteControlsProps = {
  productId: number;
  initialIsFavorite: boolean;
};

export default function FavoriteControls({
  productId,
  initialIsFavorite,
}: FavoriteControlsProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      let res;
      if (isFavorite) {
        res = await fetch(`/api/favorites/${productId}`, {
          method: "DELETE",
        });
      } else {
        res = await fetch(`/api/favorites`, {
          method: "POST",
          body: JSON.stringify({ productId }),
          headers: { "Content-Type": "application/json" },
        });
      }

      if (res.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("お気に入りの更新に失敗しました。", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="text-teal-800 hover:underline disabled:opacity-50"
      style={{ fontFamily: "sans-serif" }}
    >
      {isFavorite ? "♥ お気に入り解除" : "♡ お気に入り追加"}
    </button>
  );
}
