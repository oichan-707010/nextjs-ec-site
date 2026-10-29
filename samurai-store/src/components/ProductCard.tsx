"use client"; //クライアント(ブラウザ)側で動作

import Link from "next/link";
import Image from "next/image";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;

  imageUrl?: string;
  imageSize?: 300 | 400;

  rating?: number;
  reviewCount?: number;

  showCartButton?: boolean;
  className?: string;
}

export default function ProductCard({
  id,
  title,
  price,
  imageUrl,
  imageSize = 300,
  rating,
  reviewCount,
  showCartButton = false,
  className = "",
}: ProductCardProps) {
  const finalImageUrl = imageUrl
    ? `/uploads/${imageUrl}`
    : "/images/no-image.jpg";

  return (
    <div
      className={`flex flex-col bg-white max-w-sm w-full p-2 ${className} dark:bg-black dark:text-white`}
    >
      <Link href={`/products/${id}`}>
        <Image
          src={finalImageUrl}
          alt={title || "商品画像"}
          width={imageSize}
          height={imageSize}
          className="w-full object-contain aspect-square"
        />
      </Link>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold leading-tight mb-1">{title}</h3>
        {rating !== undefined && reviewCount !== undefined && (
          <p>☆☆☆☆☆（-件）</p>
        )}
        <div className="flex justify-between items-center w-full mt-2">
          <p className="text-lg font-bold">¥{price.toLocaleString()}</p>
          {showCartButton && (
            <button className="border border-indigo-500 hover:bg-indigo-400 text-indigo-500 hover:text-white py-2 px-4 rounded-sm dark:border-indigo-300 dark:text-indigo-200">
              カートへ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
