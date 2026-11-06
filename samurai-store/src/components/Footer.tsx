import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  // const currentYear = new Date().getFullYear();
  const currentYear = 2026;

  return (
    <footer className="bg-gray-800 py-4 text-white">
      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-[2.5fr_1.5fr_1fr] gap-8 border-b border-gray-700 pb-8 mb-8">
        <div>
          <h3 className="text-xl mb-4">SAMURAI Storeについて</h3>
          <p className="text-sm leading-relaxed">
            最新のトレンドとテクノロジーを取り入れたアイテムをお届けします。
          </p>
        </div>

        <div>
          <h3 className="text-xl mb-4">クイックリンク</h3>
          <ul className="space-y-2 list-none pl-0">
            <li>
              <Link href="/privacy" className="hover:underline">
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                利用規約
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl mb-4">お問い合わせ</h3>
          <p>
            <Link href="/contact" className="hover:underline">
              お問い合わせはこちら
            </Link>
          </p>
          <div className="flex space-x-4 mt-4">
            <Image
              src="/icons/facebook-icon.png"
              alt="Facebook"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <Image
              src="/icons/x-icon.svg"
              alt="X"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <Image
              src="/icons/youtube-icon.svg"
              alt="YouTube"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 text-center text-sm">
        <p>&copy; {currentYear} SAMURAI Store. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
