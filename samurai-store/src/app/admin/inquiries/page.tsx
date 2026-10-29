import Link from "next/link";

type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default async function AdminInquiriesPage() {
  const res = await fetch(`${process.env.BASE_URL}/api/inquiries`, {
    cache: "no-store",
  });
  const { inquiries }: { inquiries: Inquiry[] } = await res.json();

  const tableStyle = "px-5 py-3 border-b border-gray-300";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin/products" className="text-indigo-600 hover:underline">
        ← 商品一覧ページに戻る
      </Link>
      <h1 className="text-center mt-4">お問い合わせ一覧</h1>
      <div className="overflow-hidden rounded-lg shadow-md">
        <table className="w-full bg-white">
          <thead className="bg-gray-200 text-gray-700 dark:text-white dark:bg-gray-500">
            <tr className="text-left">
              <th className={tableStyle}>ID</th>
              <th className={tableStyle}>氏名</th>
              <th className={tableStyle}>メールアドレス</th>
              <th className={tableStyle}>お問い合わせ内容</th>
              <th className={tableStyle}>送信日時</th>
            </tr>
          </thead>
          <tbody className="dark:bg-white dark:text-black">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className={tableStyle}>{inquiry.id}</td>
                <td className={`${tableStyle} whitespace-nowrap`}>
                  {inquiry.name}
                </td>
                <td className={tableStyle}>{inquiry.email}</td>
                <td className={tableStyle}>{inquiry.message}</td>
                <td className={tableStyle}>
                  {new Date(inquiry.created_at).toLocaleDateString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
