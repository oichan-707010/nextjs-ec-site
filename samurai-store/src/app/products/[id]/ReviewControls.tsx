"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type ReviewControlsProps = {
  productId: number;
  loggedIn: boolean;
};

export default function ReviewControls({
  productId,
  loggedIn,
}: ReviewControlsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [rating, setRating] = useState(0);
  const [clickedRating, setClickedRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleScoreClick = (selectedScore: number) => {
    setRating(selectedScore);
    setClickedRating(selectedScore);
  };

  const handleSubmitReview = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (rating === 0 || !content.trim()) {
      setErrorMessage("全ての項目を入力してください。");
      return;
    }

    if (!loggedIn) {
      setErrorMessage("レビューの投稿にはログインが必要です。");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, content }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSuccessMessage("レビューが正常に投稿されました！");
        setRating(0);
        setClickedRating(0);
        setContent("");

        router.refresh();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "レビューの投稿に失敗しました。");
      }
    } catch {
      setErrorMessage("通信エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    const redirectUrl = encodeURIComponent(pathname);
    router.push(`/login?redirect=${redirectUrl}`);
  };

  return (
    <div>
      <h2 className="mt-2">レビューを投稿する</h2>
      {!loggedIn ? (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            レビューの投稿にはログインが必要です。
          </p>
          <button
            onClick={handleLoginRedirect}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-md shadow-md"
          >
            ログインしてレビューを投稿
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label
              htmlFor="score"
              className="block text-gray-700 font-semibold mb-2"
            >
              評価
            </label>
            <div className="flex text-2xl text-yellow-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="cursor-pointer"
                  onClick={() => handleScoreClick(s)}
                  onMouseEnter={() => setRating(s)}
                  onMouseLeave={() => setRating(clickedRating)}
                >
                  {s <= rating ? "★" : "☆"}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-gray-700 font-semibold mb-2"
            >
              コメント
            </label>
            <textarea
              id="content"
              name="content"
              rows={4}
              value={content}
              disabled={submitting}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-y"
              placeholder="商品の感想や体験を具体的にご記入ください。"
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && (
              <p className="text-green-600">{successMessage}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-md ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
          >
            {submitting ? "投稿中..." : "レビューを投稿"}
          </button>
        </form>
      )}
    </div>
  );
}
