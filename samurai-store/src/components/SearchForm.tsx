"use client";

import { useSearchParams } from "next/navigation";

type SearchFormProps = {
  perPage?: string;
  sort?: string;
  keyword?: string;
};

// 検索フォームの見た目（Suspenseのfallbackでも使用）
export function SearchFormView({
  perPage = "16",
  sort = "new",
  keyword = "",
}: SearchFormProps) {
  return (
    <form action="/products" method="GET" className="hidden sm:block">
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="perPage" value={perPage} />
      <input type="hidden" name="sort" value={sort} />
      <input
        type="text"
        name="keyword"
        placeholder="検索..."
        defaultValue={keyword}
        className="border border-gray-300 rounded-md py-1 px-3 text-sm focus:ring-2 focus:ring-indigo-500"
      />
    </form>
  );
}

// URLのクエリパラメータを引き継ぐ検索フォーム
export default function SearchForm() {
  const searchParams = useSearchParams();

  return (
    <SearchFormView
      perPage={searchParams.get("perPage") || "16"}
      sort={searchParams.get("sort") || "new"}
      keyword={searchParams.get("keyword") || ""}
    />
  );
}
