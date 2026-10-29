import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) throw new Error("環境変数JWT_SECRETが設定されていません。");
const secret = new TextEncoder().encode(SECRET_KEY);

export function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (err) {
    console.error("jwtVerify失敗：", err);
    return null;
  }
}
