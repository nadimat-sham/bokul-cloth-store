import mysql from "mysql2/promise";
import type { PoolConnection } from "mysql2/promise";
import { config } from "./config.ts";

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  charset: "utf8mb4",
});

/** Runs `fn` inside a transaction, committing on success and rolling back on error. */
export async function transaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
