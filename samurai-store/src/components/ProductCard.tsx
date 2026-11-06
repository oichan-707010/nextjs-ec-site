"use client"; //クライアント(ブラウザ)側で動作

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

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
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(id);

  const handleCart = () => {
    addItem({ id, title, price, imageUrl });
  };

  const finalImageUrl = imageUrl
    ? `/uploads/${imageUrl}`
    : "/images/no-image.jpg";

  const displayStars = (avgRating: number) => {
    const rating = Math.round(avgRating);
    const filledStars = "★".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    return `${filledStars}${emptyStars}`;
  };

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
        {rating !== undefined &&
          reviewCount !== undefined &&
          (reviewCount > 0 ? (
            <p className="flex items-center text-sm mb-1">
              <span className="text-yellow-500 mr-1">
                {displayStars(rating || 0)}
              </span>
              <span className="text-gray-600">({reviewCount}件)</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              まだレビューがありません
            </p>
          ))}
        <div className="flex justify-between items-center w-full mt-2">
          <p className="text-lg font-bold">¥{price.toLocaleString()}</p>
          {showCartButton && (
            <button
              onClick={!inCart ? handleCart : undefined}
              disabled={inCart}
              className={`border py-2 px-4 rounded-sm
                 ${inCart ? "bg-indigo-500 text-white" : "border-indigo-500 text-indigo-500 hover:bg-indigo-400 hover:text-white dark:border-indigo-300 dark:text-indigo-200"}
                 `}
            >
              {inCart ? "追加済み" : "カートへ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
