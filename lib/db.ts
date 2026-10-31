import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon（Postgres）クライアント。接続はサーバ側のみ。
 * DATABASE_URL 未設定なら sql は null（呼び出し側で空に倒す）。
 * 公開範囲の制御はクエリ条件（expires_at > now()）で担保する。
 */
const connectionString = process.env.DATABASE_URL;

export const sql: NeonQueryFunction<false, false> | null = connectionString
  ? neon(connectionString, { fetchOptions: { cache: "no-store" } })
  : null;

export function hasDb(): boolean {
  return sql !== null;
}
