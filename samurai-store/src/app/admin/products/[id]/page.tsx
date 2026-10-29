"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { type ProductData } from "@/types/product";

type Product = ProductData;

export default function ProductEditPage() {
  const router = useRouter();
  const { id: productId } = useParams();

  const [productData, setProductData] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.message || "商品情報の取得に失敗しました。");
          setLoading(false);
          return;
        }
        setProductData(data);
      } catch {
        setErrorMessage("通信エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      getProduct();
    }
  }, [productId]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const price = Number(formData.get("price") as string);
    const stock = Number(formData.get("stock") as string);

    if (!name.trim()) {
      setErrorMessage("商品名は必須です。");
      return;
    }
    if (price < 0 || stock < 0) {
      setErrorMessage("価格と在庫数は0以上の数値を入力してください。");
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/products?edited=1");
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "更新に失敗しました。");
      }
    } catch {
      setErrorMessage("通信エラーが発生しました。");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 text-lg">
        商品データを読み込み中です...
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-center mb-6">商品編集</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      {productData && (
        <ProductForm
          onSubmit={handleSubmit}
          initialValues={productData}
          submitLabel="更新"
        />
      )}
    </main>
  );
}
