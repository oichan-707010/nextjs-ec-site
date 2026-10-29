"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect, useRef } from "react";
import SearchForm, { SearchFormView } from "@/components/SearchForm";
import type { AuthUser } from "@/lib/auth";

export interface HeaderProps {
  user: AuthUser | null;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const menuItemStyle =
    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";

  return (
    <header className="bg-white text-black shadow-md dark:bg-gray-800 dark:text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-baseline">
        <div className="shrink-0">
          <Link href="/">
            <Image
              src="/images/samurai-store-logo-tp.png"
              alt="SAMURAI Store"
              width={910}
              height={200}
              className="w-[250px] h-[55px] object-contain"
            />
          </Link>
        </div>

        <nav className="grow text-center mt-8">
          <ul className="flex justify-center space-x-8 list-none">
            <li className="border-r border-gray-300 pr-8">
              <Link href="/">ホーム</Link>
            </li>
            <li className="border-r border-gray-300 pr-8">
              <Link href="/products">商品一覧</Link>
            </li>
            <li>
              <Link href="/contact">お問い合わせ</Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-6 shrink-0">
          <Suspense fallback={<SearchFormView />}>
            <SearchForm />
          </Suspense>
          <Link href="/account/favorites">
            <Image
              src="/icons/heart-icon.svg"
              alt="Favorites"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </Link>
          <Link href="/cart">
            <Image
              src="/icons/cart-icon.svg"
              alt="Cart"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </Link>
          <div className="relative" ref={menuRef}>
            <button onClick={toggleMenu} className="cursor-pointer">
              <Image
                src="/icons/account-icon.svg"
                alt="Account"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
              )}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-300">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={closeMenu}
                      className={menuItemStyle}
                    >
                      マイページ
                    </Link>
                    <form method="POST" action="/api/auth/logout">
                      <button
                        type="submit"
                        className={`${menuItemStyle} w-full text-left`}
                      >
                        ログアウト
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className={menuItemStyle}
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMenu}
                      className={menuItemStyle}
                    >
                      会員登録
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
