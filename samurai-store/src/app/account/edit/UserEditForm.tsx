"use client";

import UserForm from "@/components/UserForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  initialValues: { name: string; email: string };
}

export default function UserEditForm({ initialValues }: Props) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name?.trim() || !email?.trim()) {
      setErrorMessage("全ての項目を入力してください。");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        body: JSON.stringify({ name, email }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/account?edited=1");
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "更新に失敗しました。");
      }
    } catch (err) {
      console.error("通信エラーが発生しました。", err);
      setErrorMessage("通信エラーが発生しました。");
    }
  };

  return (
    <>
      {errorMessage && (
        <p className="text-red-600 text-center mt-8">{errorMessage}</p>
      )}
      <UserForm
        onSubmit={handleSubmit}
        initialValues={initialValues}
        submitLabel="更新"
      />
    </>
  );
}
