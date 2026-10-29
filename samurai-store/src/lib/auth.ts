import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export type AuthUser = {
  userId: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

export const AUTH_TOKEN = "authToken";

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN)?.value;
  if (!token) {
    return null;
  }

  const user = (await verifyToken(token)) as AuthUser | null;
  return user;
}

export async function isLoggedIn(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.isAdmin ?? false;
}
