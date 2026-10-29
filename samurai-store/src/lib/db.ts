import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

export async function executeQuery<T = unknown>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (err) {
    console.error("SQL実行エラー：", err);
    throw err;
  }
}
