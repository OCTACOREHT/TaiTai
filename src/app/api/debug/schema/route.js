import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows: tables } = await db.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name`,
    );

    const result = {};

    for (const table of tables) {
      const { rows: columns } = await db.query(
        `SELECT column_name, data_type
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [table.table_name],
      );

      result[table.table_name] = columns;
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur serveur.", details: err.message },
      { status: 500 },
    );
  }
}
