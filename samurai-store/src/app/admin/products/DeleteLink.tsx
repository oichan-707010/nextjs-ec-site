"use client";

import { useRouter } from "next/navigation";

export default function DeleteLink({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `「${name}」を削除すると元に戻せません。\n削除してもよろしいですか？`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (res.ok) {
        router.push(`/admin/products?deleted=1`);
      } else {
        const data = await res.json();
        alert(data.message || "削除に失敗しました。");
      }
    } catch {
      alert("通信エラーが発生しました。");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-700 cursor-pointer"
    >
      削除
    </button>
  );
}
