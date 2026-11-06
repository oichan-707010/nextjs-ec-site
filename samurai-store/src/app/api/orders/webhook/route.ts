import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrder } from "@/app/api/orders/orderService";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!SECRET_KEY)
  throw new Error("環境変数STRIPE_SECRET_KEYが設定されていません。");
if (!STRIPE_WEBHOOK_SECRET)
  throw new Error("環境変数STRIPE_WEBHOOK_SECRETが設定されていません。");

const stripe = new Stripe(SECRET_KEY, { apiVersion: "2026-10-28.endive" });

export async function POST(request: NextRequest) {
  const requestBody = await request.text();

  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      requestBody,
      signature ?? "",
      STRIPE_WEBHOOK_SECRET ?? "",
    );
  } catch (err) {
    console.error("Webhook署名検証エラー：", err);
    return NextResponse.json(
      { message: "Webhook署名検証に失敗しました。" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.orderId;
    const userId: string = session.metadata?.userId ?? "";
    if (!orderId || !userId) {
      console.error("WebhookにorderIdまたはuserIdが含まれていません。");
      return NextResponse.json(
        { message: "注文情報が不正です。" },
        { status: 400 },
      );
    }

    try {
      await updateOrder(Number(userId), Number(orderId), "処理中", "決済成功");
    } catch (err) {
      console.error("注文ステータス更新エラー：", err);
      return NextResponse.json(
        {
          message: "注文ステータス更新に失敗しました。",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
