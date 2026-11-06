import { getAuthUser, type AuthUser } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export interface OrderData {
  id: number;
  totalPrice: number;
  status: "未処理" | "処理中" | "出荷済み" | "完了" | "キャンセル" | "返金済み";
  paymentStatus:
    | "未決済"
    | "決済処理中"
    | "決済成功"
    | "決済失敗"
    | "返金処理中"
    | "返金済み";
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderJoinRecord {
  id: number;
  totalPrice: number;
  status: "未処理" | "処理中" | "出荷済み" | "完了" | "キャンセル" | "返金済み";
  paymentStatus:
    | "未決済"
    | "決済処理中"
    | "決済成功"
    | "決済失敗"
    | "返金処理中"
    | "返金済み";
  createdAt: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export async function GET() {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }
    const ordersData = await executeQuery<OrderJoinRecord>(
      `
      SELECT 
      o.id AS id,
      o.total_price AS totalPrice,
      o.status AS status,
      o.payment_status AS paymentStatus,
      o.created_at AS createdAt,
      oi.product_name AS productName,
      oi.quantity AS quantity,
      oi.unit_price AS unitPrice 
      FROM orders AS o 
      JOIN order_items AS oi ON o.id = oi.order_id 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC, oi.id ASC;
      `,
      [user.userId],
    );
    const ordersMap = new Map<number, OrderData>();
    ordersData.forEach((row: OrderJoinRecord) => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          totalPrice: row.totalPrice,
          status: row.status,
          paymentStatus: row.paymentStatus,
          createdAt: row.createdAt,
          items: [],
        });
      }

      ordersMap.get(row.id)!.items.push({
        productName: row.productName,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
      });
    });

    const orders = Array.from(ordersMap.values());
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("注文取得エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
