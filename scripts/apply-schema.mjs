// Apply plaza neon/schema.sql + neon/seed.sql to the Neon project over HTTPS
// (the @neondatabase/serverless HTTP driver). DATABASE_URL comes from the
// environment; this script never prints it.
// Usage: DATABASE_URL=... node scripts/apply-schema.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}
const sql = neon(url);

// Execute one raw statement through the tagged-template function
// (@neondatabase/serverless 0.10 has no sql.query for plain text).
function execRaw(stmt) {
  const strings = Object.assign([stmt], { raw: [stmt] });
  return sql(strings);
}

// Split a SQL script into statements on top-level semicolons, respecting
// $$...$$ bodies, single quotes, and -- line comments.
function splitStatements(script) {
  const out = [];
  let buf = "";
  let i = 0;
  let inDollar = false;
  let inQuote = false;
  let inComment = false;
  while (i < script.length) {
    const ch = script[i];
    const two = script.slice(i, i + 2);
    if (inComment) {
      buf += ch;
      if (ch === "\n") inComment = false;
      i += 1;
      continue;
    }
    if (inDollar) {
      buf += ch;
      if (two === "$$") {
        buf += script[i + 1];
        i += 2;
        inDollar = false;
        continue;
      }
      i += 1;
      continue;
    }
    if (inQuote) {
      buf += ch;
      if (ch === "'") {
        if (script[i + 1] === "'") {
          buf += script[i + 1];
          i += 2;
          continue;
        }
        inQuote = false;
      }
      i += 1;
      continue;
    }
    if (two === "--") inComment = true;
    else if (two === "$$") {
      inDollar = true;
      buf += two;
      i += 2;
      continue;
    } else if (ch === "'") inQuote = true;
    else if (ch === ";") {
      const stmt = buf.trim();
      if (stmt) out.push(stmt);
      buf = "";
      i += 1;
      continue;
    }
    buf += ch;
    i += 1;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

async function runFile(path) {
  const script = readFileSync(path, "utf-8");
  const stmts = splitStatements(script);
  let n = 0;
  for (const stmt of stmts) {
    await execRaw(stmt);
    n += 1;
  }
  console.log(`${path}: ${n} statements applied`);
}

await runFile(new URL("../neon/schema.sql", import.meta.url).pathname);
await runFile(new URL("../neon/seed.sql", import.meta.url).pathname);

const tables = await sql`select table_name from information_schema.tables where table_schema='public' order by table_name`;
const views = await sql`select table_name from information_schema.views where table_schema='public' order by table_name`;
const counts = {};
for (const t of ["boards", "threads", "posts", "notices"]) {
  const rows = await execRaw(`select count(*)::int as c from public.${t}`);
  counts[t] = rows[0].c;
}
console.log(JSON.stringify({
  tables: tables.map((r) => r.table_name),
  views: views.map((r) => r.table_name),
  row_counts: counts,
}));
