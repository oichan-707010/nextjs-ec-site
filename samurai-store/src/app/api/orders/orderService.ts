import { executeQuery } from "@/lib/db";
import { CartItem } from "@/hooks/useCart";
import { type ResultSetHeader } from "mysql2/promise";

type OrderStatus =
  | "未処理"
  | "処理中"
  | "出荷済み"
  | "完了"
  | "キャンセル"
  | "返金済み";

type PaymentStatus =
  | "未決済"
  | "決済処理中"
  | "決済成功"
  | "決済失敗"
  | "返金処理中"
  | "返金済み";

export async function checkStock(cartItems: CartItem[]): Promise<string[]> {
  const shortageItems: string[] = [];

  for (const item of cartItems) {
    const result = await executeQuery<{ name: string; stock: number }>(
      `SELECT name, stock FROM products WHERE id = ? LIMIT 1;`,
      [item.id],
    );
    const product = result[0];

    if (!product || (product.stock ?? 0) < item.quantity) {
      shortageItems.push(product?.name || `ID:${item.id}`);
    }
  }

  return shortageItems;
}

export async function createOrder(
  userId: number,
  cartItems: CartItem[],
  address: string,
  totalPrice: number,
): Promise<number> {
  if (!Array.isArray(cartItems) || cartItems.length === 0)
    throw new Error("カートが空です。");
  if (!address?.trim()) throw new Error("配送先が未入力です。");
  if (isNaN(totalPrice) || totalPrice <= 0)
    throw new Error("合計金額が不正です。");

  const result = (await executeQuery<{ insertId: number }>(
    `
    INSERT INTO orders (user_id, total_price, status, payment_status, shipping_address)
     VALUES (?, ?, '未処理', '未決済', ?);`,
    [userId, totalPrice, address],
  )) as unknown as ResultSetHeader;

  const orderId = result.insertId;
  if (!orderId) throw new Error("注文登録に失敗しました。");

  for (const product of cartItems) {
    await executeQuery(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?);`,
      [orderId, product.id, product.title, product.quantity, product.price],
    );
  }

  return orderId;
}

export async function updateOrder(
  userId: number,
  orderId: number,
  status?: OrderStatus,
  paymentStatus?: PaymentStatus,
) {
  if (!userId) throw new Error("認証されていません。");
  if (!orderId) throw new Error("注文IDが必要です。");

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (status) {
    fields.push("status = ?");
    values.push(status);
  }
  if (paymentStatus) {
    fields.push("payment_status = ?");
    values.push(paymentStatus);
  }

  if (fields.length === 0) return;

  values.push(orderId, userId);

  const result = (await executeQuery<ResultSetHeader>(
    `
      UPDATE orders SET ${fields.join(",")} WHERE id = ? AND user_id = ? AND payment_status != '決済成功';`,
    values,
  )) as unknown as ResultSetHeader;

  if (paymentStatus === "決済成功" && result.affectedRows > 0) {
    const orderItems = await executeQuery<{
      product_id: number;
      quantity: number;
    }>(`SELECT product_id, quantity FROM order_items WHERE order_id = ?;`, [
      orderId,
    ]);

    for (const item of orderItems) {
      await executeQuery(
        `UPDATE products SET stock = stock - ?, sales_count = sales_count + ?, updated_at = NOW()
          WHERE id = ?;`,
        [item.quantity, item.quantity, item.product_id],
      );
    }
  }
}
