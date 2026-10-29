"use client";

import UserForm from "@/components/UserForm";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserResisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !confirmPassword?.trim()
    ) {
      setErrorMessage("すべての項目を入力してください。");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません。");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/?registered=1");
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "登録に失敗しました。");
      }
    } catch (err) {
      setErrorMessage("通信エラーが発生しました。");
    }
  };

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-center mb-4">会員登録</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mt-8">{errorMessage}</p>
      )}
      <UserForm
        onSubmit={handleSubmit}
        withPassword={true}
        submitLabel="登録"
      />
    </main>
  );
}
