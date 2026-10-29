"use client";

import ProductCard, { type ProductCardProps } from "./ProductCard";

interface ProductListProps {
  products: ProductCardProps[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {products.length === 0 ? (
        <p className="col-span-full text-center text-gray-500 text-lg py-10">
          表示する商品がありません。
        </p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            imageSize={300}
            showCartButton
          />
        ))
      )}
    </div>
  );
}
