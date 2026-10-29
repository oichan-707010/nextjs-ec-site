"use client";

interface UserFormProps {
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;

  initialValues?: {
    name: string;
    email: string;
  };
  submitLabel: string;
  withPassword: boolean;
}

const inputStyle =
  "w-full border border-gray-300 px-3 py-2 rounded-sm focus:ring-2 focus:ring-indigo-500";
const labelStyle = "block font-bold mb-1";
const badgeStyle =
  "ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md";

export default function UserForm({
  onSubmit,
  initialValues = { name: "", email: "" },
  submitLabel,
  withPassword = false,
}: UserFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl"
    >
      <label className={labelStyle} htmlFor="name">
        氏名
        <span className={badgeStyle}>必須</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        defaultValue={initialValues.name}
        className={inputStyle}
      />

      <label className={labelStyle} htmlFor="email">
        メールアドレス
        <span className={badgeStyle}>必須</span>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        defaultValue={initialValues.email}
        className={inputStyle}
      />

      {withPassword && (
        <>
          <label className={labelStyle} htmlFor="password">
            パスワード
            <span className={badgeStyle}>必須</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className={inputStyle}
          />

          <label className={labelStyle} htmlFor="confirmPassword">
            パスワード(確認用)
            <span className={badgeStyle}>必須</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            className={inputStyle}
          />
        </>
      )}

      <button
        type="submit"
        className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-sm"
      >
        {submitLabel}
      </button>
    </form>
  );
}
