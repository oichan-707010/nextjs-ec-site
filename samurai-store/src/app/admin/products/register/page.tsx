"use client";

import ProductForm from "@/components/ProductForm";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductRegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const imageFile = formData.get("imageFile") as File;
    const price = Number(formData.get("price") as string);
    const stock = Number(formData.get("stock") as string);

    if (!name.trim() || !imageFile) {
      setErrorMessage("すべての必須項目を入力してください。");
      return;
    }
    if (price < 0 || stock < 0) {
      setErrorMessage("価格と在庫数は0以上の数値を入力してください。");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/products?registered=1");
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "登録に失敗しました。");
      }
    } catch {
      setErrorMessage("通信エラーが発生しました。");
    }
  };

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-center mb-6">商品登録</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      <ProductForm onSubmit={handleSubmit} submitLabel="登録" />
    </main>
  );
}
