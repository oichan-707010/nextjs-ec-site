"use client";

interface Props {
  sort: string;
  perPage: number;
  keyword: string;
}

export default function Sort({ sort, perPage, keyword }: Props) {
  return (
    <form
      action="/products"
      method="GET"
      className=" flex flex-col md:flex-row gap-4"
    >
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="perPage" value={perPage} />
      <input type="hidden" name="keyword" value={keyword} />
      <select
        name="sort"
        value={sort}
        className="border border-gray-300 rounded px-4 py-2 w-full md:w-48"
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        <option value="new">新着順</option>
        <option value="priceAsc">価格が安い順</option>
      </select>
    </form>
  );
}
