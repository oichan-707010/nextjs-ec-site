import { notFound, unstable_rethrow } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { type ProductData } from "@/types/product";
import { AUTH_TOKEN, isLoggedIn } from "@/lib/auth";
import CartControls from "@/app/products/[id]/CartControls";
import { type ReviewResponse } from "@/types/review";
import ReviewControls from "@/app/products/[id]/ReviewControls";
import { cookies } from "next/headers";
import FavoriteControls from "@/app/products/[id]/FavoriteControls";

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
    // プリレンダリング中断などNext.js内部のエラーは握りつぶさず、Next.jsに処理を任せる
    unstable_rethrow(err);
    console.error("商品取得エラー:", err);
    return null;
  }
}

async function getReviews(id: string): Promise<ReviewResponse | []> {
  const res = await fetch(
    `${process.env.BASE_URL}/api/products/${id}/reviews`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return [];
  return await res.json();
}

async function getFavorite(id: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN)?.value;
  const headers: HeadersInit = token
    ? { Cookie: `${AUTH_TOKEN}=${token}` }
    : {};

  const res = await fetch(`${process.env.BASE_URL}/api/favorites/${id}`, {
    cache: "no-store",
    headers: headers,
  });

  if (!res.ok) return false;
  return await res.json();
}

function displayStars(avgRating: number) {
  const rating = Math.round(avgRating);
  const filledStars = "★".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);
  return `${filledStars}${emptyStars}`;
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const resolveParams = await props.params;
  const productId = resolveParams.id;

  const [product, reviewsResponse, isFavorite] = await Promise.all([
    getProduct(productId),
    getReviews(productId),
    getFavorite(productId),
  ]);

  if (!product) {
    notFound();
  }

  const reviews = Array.isArray(reviewsResponse) ? [] : reviewsResponse.reviews;
  const rating = Array.isArray(reviewsResponse)
    ? 0
    : reviewsResponse.review_avg;
  const reviewCount = Array.isArray(reviewsResponse)
    ? 0
    : reviewsResponse.pagination.totalItems;

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
          className="w-full object-contain md:w-1/2 max-h-[600px]"
        />
        <div className="w-full md:w-1/2 space-y-6 pt-4">
          <h1>{product.name}</h1>
          <p className="text-gray-700 whitespace-pre-line dark:text-gray-300">
            {product.description}
          </p>
          <p className="text-3xl font-bold text-indigo-600">
            ¥{product.price.toLocaleString()}
            <span className="text-base font-normal text-gray-500">(税込)</span>
          </p>
          {reviewCount > 0 ? (
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 text-xl mr-2">
                {displayStars(rating)}
              </span>
              <span className="text-gray-700 text-base">
                {rating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                （レビュー{reviewCount}件）
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">
              まだレビューがありません
            </p>
          )}
          <p className={`text-base font-medium ${stockStyle}`}>
            在庫状況：{stockText}
          </p>

          {/* 一般ユーザー向け項目 */}
          <div className="space-y-6 mt-8">
            {stock > 0 && (
              <CartControls
                cartItem={{
                  id: product.id.toString(),
                  title: product.name,
                  price: product.price,
                  imageUrl: product.image_url ?? "",
                }}
                stock={stock}
                loggedIn={loggedIn}
              />
            )}

            {loggedIn && (
              <FavoriteControls
                productId={product.id}
                initialIsFavorite={isFavorite}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6 p-4 border border-gray-300 rounded-md shadow-sm">
        <div className="w-full md:w-1/2">
          <h2 className="mt-2">レビュー一覧</h2>
          {reviewCount > 0 ? (
            <>
              <ul className="space-y-4 list-none">
                {reviews.slice(0, 3).map((r) => (
                  <li key={r.id} className="border-b border-gray-300 pb-2">
                    <div className="flex items-center text-sm text-yellow-500 mb-1">
                      {displayStars(r.score)}
                    </div>
                    <p className="text-gray-800 dark:text-gray-300">
                      {r.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.user_name} さん{" "}
                      {new Date(r.created_at).toLocaleString("ja-JP")}
                    </p>
                  </li>
                ))}
              </ul>
              {reviewCount > 3 && (
                <div className="text-center mt-4">
                  <Link
                    href={`/products/${productId}/reviews`}
                    className="text-indigo-600 hover:underline"
                  >
                    全てのレビューを見る({reviewCount}件)
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">まだレビューがありません</p>
          )}
        </div>
        <div className="w-full md:w-1/2 border-l border-gray-200 pl-6">
          <ReviewControls productId={product.id} loggedIn={loggedIn} />
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href="/products" className="text-indigo-600 hover:underline">
          商品一覧に戻る
        </Link>
      </div>
    </main>
  );
}
