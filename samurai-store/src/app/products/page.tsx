import ProductList from "@/components/ProductList";
import { type ProductCardProps } from "@/components/ProductCard";
import { type ProductData } from "@/types/product";
import Pagination from "@/components/Pagination";
import Sort from "@/app/products/Sort";

type Product = Pick<
  ProductData,
  "id" | "name" | "price" | "image_url" | "review_avg" | "review_count"
>;

interface ProductsPageData {
  products: Product[];

  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// 商品一覧ページ
export default async function ProductsPages({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const page = Number(sp?.page ?? "1");
  const perPage = Number(sp?.perPage ?? "16");
  const sort = typeof sp?.sort === "string" ? sp.sort : "new";
  const keyword = typeof sp?.keyword === "string" ? sp.keyword : "";

  // クエリパラメータを1つの文字列にまとめる
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort,
    keyword,
  });

  // 商品APIから商品データを取得
  const res = await fetch(
    `${process.env.BASE_URL}/api/products?${query.toString()}`,
    {
      cache: "no-store",
    },
  );

  // APIから返されたデータをJavascriptの配列に変換
  const productsPageData: ProductsPageData = await res.json();
  if (!Array.isArray(productsPageData.products)) {
    console.error("商品データの取得に失敗しました。");
    return (
      <p className="text-center text-gray-500 text-lg py-10">
        商品データの取得に失敗しました。
      </p>
    );
  }

  // 商品カード形式に変換
  const products: ProductCardProps[] = productsPageData.products.map(
    (row: Product) => ({
      id: String(row.id),
      title: row.name,
      price: row.price,
      rating: row.review_avg,
      reviewCount: row.review_count,
      imageUrl: row.image_url ?? undefined,
    }),
  );

  return (
    <main className="p-8">
      <h1>商品一覧</h1>
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <p className="text-lg mt-4">
          {keyword && (
            <>
              ｢<span className="text-blue-600 font-semibold">{keyword}</span>
              」の検索結果：
            </>
          )}
          {productsPageData.pagination.totalItems}件の商品が見つかりました
          (&nbsp;
          {productsPageData.pagination.totalPages}&nbsp;ページ中&nbsp;
          {productsPageData.pagination.currentPage}&nbsp;ページ目を表示)
        </p>
        <Sort sort={sort} perPage={perPage} keyword={keyword} />
      </section>

      <section className="mb-8">
        <ProductList products={products} />
      </section>

      <section className="mb-8">
        {productsPageData.pagination.totalPages > 0 && (
          <Pagination
            currentPage={productsPageData.pagination.currentPage}
            totalPages={productsPageData.pagination.totalPages}
          />
        )}
      </section>
    </main>
  );
}
