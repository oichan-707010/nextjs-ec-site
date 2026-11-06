import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkStock, createOrder } from "@/app/api/orders/orderService";
import { getAuthUser, type AuthUser } from "@/lib/auth";
import { CartItem } from "@/hooks/useCart";
import { executeQuery } from "@/lib/db";

const SHIPPING_COST = 500;

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!SECRET_KEY)
  throw new Error("環境変数STRIPE_SECRET_KEYが設定されていません。");

const stripe = new Stripe(SECRET_KEY, {
  apiVersion: "2026-10-28.endive",
});

export async function POST(request: NextRequest) {
  try {
    const { items, address }: { items: CartItem[]; address: string } =
      await request.json();

    const shortageItems = await checkStock(items);
    if (shortageItems.length > 0) {
      return NextResponse.json(
        { message: `在庫不足の商品があります：${shortageItems.join("、")}` },
        { status: 400 },
      );
    }

    const productIds = items.map((item) => item.id);
    if (productIds.length === 0) {
      return NextResponse.json(
        { message: "商品が選択されていません。" },
        { status: 400 },
      );
    }
    const placeholders = productIds.map(() => "?").join(",");
    const products = await executeQuery<{
      id: number;
      name: string;
      price: number;
    }>(
      `
      SELECT id, name, price FROM products WHERE id IN (${placeholders});`,
      productIds,
    );

    if (products.length === 0) {
      return NextResponse.json(
        { message: "商品が見つかりませんでした。" },
        { status: 404 },
      );
    }

    let totalPrice = 0;
    const line_items = items.map((item) => {
      const product = products.find((p) => p.id === Number(item.id));
      if (!product) throw new Error(`商品ID${item.id}が見つかりません。`);

      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;

      return {
        price_data: {
          currency: "jpy",
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    });

    totalPrice += SHIPPING_COST;
    line_items.push({
      price_data: {
        currency: "jpy",
        product_data: { name: "送料" },
        unit_amount: SHIPPING_COST,
      },
      quantity: 1,
    });

    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        {
          message: "認証されていません。",
        },
        { status: 401 },
      );
    }
    const correctPriceItems = items.map((item) => {
      const product = products.find((p) => p.id === Number(item.id));
      if (!product) throw new Error(`商品ID${item.id}が見つかりません。`);
      return { ...item, price: product.price };
    });

    const orderId = await createOrder(
      user.userId,
      correctPriceItems,
      address,
      totalPrice,
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      customer_email: user.email || undefined,

      success_url: `${request.nextUrl.origin}/account?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${request.nextUrl.origin}/order-confirm`,

      metadata: {
        orderId: orderId.toString(),
        userId: user.userId.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (err) {
    console.error("注文・決済処理エラー：", err);
    return NextResponse.json(
      { message: "注文登録または決済処理に失敗しました。" },
      { status: 500 },
    );
  }
}
