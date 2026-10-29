"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface paginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: paginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(newPage));

    router.push(`?${params.toString()}`);
  };

  const baseClasses =
    "min-w-9 h-9 rounded border border-gray-300 mx-1 cursor-pointer";
  const hover = "hover:bg-gray-100 hover:text-gray-800";
  const active = "bg-indigo-500 text-white border-indigo-500";
  const disabled = "opacity-50";

  return (
    <nav
      className="flex justify-center items-center mt-8"
      aria-label="ページネーション"
    >
      {/* 前へ（<） */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseClasses} text-gray-700 ${hover} ${currentPage === 1 ? disabled : ""}`}
      >
        &lt;
      </button>
      {/* 各ページ番号 */}
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={isActive}
            className={`${baseClasses} ${isActive ? active : "text-gray-700" + hover}`}
          >
            {page}
          </button>
        );
      })}
      {/* 次へ（>） */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseClasses} text-gray-700 ${hover} ${currentPage === totalPages ? disabled : ""}`}
      >
        &gt;
      </button>
    </nav>
  );
}
