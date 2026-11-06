"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import StatusMessage from "@/components/StatusMessage";
import { type ProductData } from "@/types/product";

type Product = Pick<
  ProductData,
  "id" | "name" | "price" | "image_url" | "review_avg" | "review_count"
>;

export default function Home() {
  const [pickUp, setPickUp] = useState<Product[]>([]);
  const [newArrival, setNewArrival] = useState<Product[]>([]);
  const [hotItems, setHotItems] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products/home")
      .then((res) => res.json())
      .then((data) => {
        setPickUp(data.pickUp);
        setNewArrival(data.newArrival);
        setHotItems(data.hotItems);
      })
      .catch((err) => console.error("商品データの取得に失敗しました。", err));
  }, []);

  return (
    // <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
    <div className="min-h-screen font-sans">
      <Suspense fallback={null}>
        <StatusMessage />
      </Suspense>
      <section className="relative w-full h-[60vh] sm:h-[70vw] overflow-hidden">
        <Image
          src="/images/main-visual.jpg"
          alt="最新コレクションを発見"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-md text-shadow-lg/50">
            最新コレクションを発見
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 drop-shadow-md text-shadow-lg/50">
            あなたのスタイルをアップグレードするアイテムを見つけよう
          </p>
          <Link href="/products">
            <button className="px-6 py-3 bg-white text-blue-800 font-semibold rounded-full shadow-md hover:bg-gray-200 transition-colors text-sm sm:text-base border border-gray-700">
              今すぐ見る
            </button>
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-8 pt-8 pb-12 flex flex-col gap-4 max-w-screen-xl">
        <section>
          <h2>
            <span>Pick Up</span>
            <span className="mx-2 font-light text-gray-400">|</span>
            <span className="text-base">おすすめ商品</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {pickUp?.slice(0, 3).map((item) => (
              <ProductCard
                key={`pickup-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={item.price}
                imageUrl={item.image_url ?? undefined}
                imageSize={400}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>
            <span>New Arrival</span>
            <span className="mx-2 font-light text-gray-400">|</span>
            <span className="text-base">新着商品</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {newArrival?.slice(0, 4).map((item) => (
              <ProductCard
                key={`new-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={item.price}
                imageUrl={item.image_url ?? undefined}
                rating={item.review_avg}
                reviewCount={item.review_count}
                showCartButton
              />
            ))}
          </div>
        </section>

        <section>
          <h2>
            <span>Hot Items</span>
            <span className="mx-2 font-light text-gray-400">|</span>
            <span className="text-base">注目商品</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {hotItems?.slice(0, 4).map((item) => (
              <ProductCard
                key={`featured-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={item.price}
                imageUrl={item.image_url ?? undefined}
                rating={item.review_avg}
                reviewCount={item.review_count}
                showCartButton
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
