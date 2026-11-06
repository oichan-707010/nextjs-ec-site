import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_TOKEN } from "./lib/auth";
import { verifyToken } from "./lib/jwt";

const authPages = [
  "/account",
  "/account/edit",
  "/account/orders",
  "/account/password",
  "/account/favorites",
  "/order-confirm",
];

const adminPages = [
  "/admin/products",
  "/admin/products/register",
  "/admin/inquiries",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = [...authPages, ...adminPages].some((path) =>
    pathname.startsWith(path),
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(AUTH_TOKEN)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  const user = await verifyToken(token);
  if (!user) {
    return redirectToLogin(request);
  }

  if (adminPages.some((path) => pathname.startsWith(path))) {
    if (!user.isAdmin) {
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "redirect",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(loginUrl);
}
