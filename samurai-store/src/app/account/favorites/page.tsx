"use client";

import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Favorite = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string | null;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const res = await fetch("/api/favorites");
        if (res.ok) {
          const data = await res.json();
          setFavorites(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getFavorites();
  }, []);

  const handleRemove = async (productId: number) => {
    if (!confirm("本当にお気に入りから削除しますか？")) return;

    const res = await fetch(`/api/favorites/${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setFavorites(favorites.filter((f) => f.product_id !== productId));
    }
  };

  if (loading) return <p className="text-center py-12">読み込み中...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/account" className="text-indigo-600 hover:underline">
        ← マイページに戻る
      </Link>
      <h1 className="text-center my-6">お気に入り一覧</h1>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">
          お気に入り商品はありません。
        </p>
      ) : (
        <div className="space-y-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 p-4 border border-gray-200 rounded-md shadow-sm"
            >
              <Link href={`/products/${item.product_id}`}>
                <Image
                  src={
                    item.image_url
                      ? `/uploads/${item.image_url}`
                      : "/images/no-image.jpg"
                  }
                  alt={item.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </Link>

              <div className="grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-indigo-600 font-bold">
                  ¥{item.price.toLocaleString()}
                  <span className="text-xs text-gray-500">（税込）</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    addItem({
                      id: String(item.product_id),
                      title: item.name,
                      price: item.price,
                      imageUrl: item.image_url ?? "",
                    })
                  }
                  disabled={isInCart(String(item.product_id))}
                  className="px-4 py-2 text-sm text-white rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400"
                >
                  {isInCart(String(item.product_id))
                    ? "追加済み"
                    : "カートに追加"}
                </button>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="px-4 py-2 text-white bg-pink-600 hover:bg-pink-700 text-sm rounded-md"
                >
                  お気に入り解除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
