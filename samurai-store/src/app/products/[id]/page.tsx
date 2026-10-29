import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { type ProductData } from "@/types/product";
import { isLoggedIn } from "@/lib/auth";

type Product = ProductData;

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const product = await res.json();
    return product;
  } catch (err) {
    console.error("商品取得エラー:", err);
    return null;
  }
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const resolveParams = await props.params;
  const productId = resolveParams.id;

  const product: Product | null = await getProduct(productId);

  if (!product) {
    notFound();
  }

  const stock = product.stock ?? 0;

  let stockText = "売り切れ";
  let stockStyle = "text-red-600";
  if (stock > 10) {
    stockText = "在庫あり";
    stockStyle = "text-green-600";
  } else if (stock > 0) {
    stockText = "残りわずか";
    stockStyle = "text-orange-500";
  }

  const quantityOptions = [];
  for (let i = 1; i <= Math.min(stock, 10); i++) {
    quantityOptions.push(
      <option key={i} value={i}>
        {i}
      </option>,
    );
  }

  const finalImageUrl = product.image_url
    ? `/uploads/${product.image_url}`
    : "/images/no-image.jpg";

  const loggedIn = await isLoggedIn();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Image
          src={finalImageUrl}
          alt={product.name || "商品画像"}
          width={800}
          height={800}
          className="w-full object-contain md:w1/2 max-h-[600px]"
        />
        <div className="w-full md:w1/2 spave-y-6 pt-4">
          <h1>{product.name}</h1>
          <p className="text-gray-700 whitespace-pre-line">
            {product.description}
          </p>
          <p className="text-3xl font-bold text-indigo-600">
            ¥{product.price.toLocaleString()}
            <span className="text-base font-normal text-gray-500">(税込)</span>
          </p>
          <p className="{`text-base font-medium ${stockStyle}`}">
            在庫状況：{stockText}
          </p>

          {/* 一般ユーザー向け項目 */}
          <div className="space-y-6 mt-8">
            {stock > 0 && (
              <div className="flex items-end gap-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="quantity"
                    className="block text-sm text-gray-700"
                  >
                    数量
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    defaultValue={1}
                    className="border border-gray-300 rounded-md px-4 py-2 w-24 focus:ring-2 focus:ring-indigo-500"
                  >
                    {quantityOptions}
                  </select>
                </div>
                <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-sm ">
                  カートに追加
                </button>
                {loggedIn && (
                  <button className="border border-indigo-500 text-indigo-500 py-2 px-4 rounded-sm hover:bg-indigo-50">
                    購入手続きへ
                  </button>
                )}
              </div>
            )}

            {loggedIn && (
              <button className="text-teal-800 hover:underline">
                &#9825; お気に入り追加
              </button>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <Link href="/products" className="text-indigo-600 hover:underline">
              ← 商品一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
