import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

function normalizeEventDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export async function GET() {
  const { rows } = await db.query(
    `SELECT e.*, coalesce(array_agg(p.player_id) filter (where p.player_id is not null), '{}') as participants
     FROM club_events e
     LEFT JOIN club_event_participants p on p.event_id = e.id
     GROUP BY e.id
     ORDER BY e.date DESC`,
  );
  return NextResponse.json({ data: rows });
}
export async function POST(request) {
  const client = await db.connect();
  try {
    const body = await request.json();
    const row = body.data || body;
    const eventDate = normalizeEventDate(row.date);

    if (!row.titre || !eventDate || !row.lieu || !row.type) {
      return NextResponse.json(
        { error: "Titre, date, lieu et type sont obligatoires." },
        { status: 400 },
      );
    }

    const participants = Array.isArray(row.participants)
      ? row.participants.filter(Boolean)
      : [];

    await client.query("BEGIN");
    await client.query(
      "INSERT INTO club_events (id, titre, date, lieu, type, calendar_color) VALUES ($1,$2,$3,$4,$5,$6)",
      [row.id, row.titre, eventDate, row.lieu, row.type, row.calendarColor || null],
    );
    for (const participantId of participants) {
      await client.query(
        "INSERT INTO club_event_participants (event_id, player_id) VALUES ($1,$2)",
        [row.id, participantId],
      );
    }
    await client.query("COMMIT");
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[POST /api/club/events]", err.message);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? err.message : "Erreur creation evenement.",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
export async function PUT(request) {
  const client = await db.connect();
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    await client.query("BEGIN");
    await client.query("DELETE FROM club_event_participants");
    await client.query("DELETE FROM club_events");
    for (const row of rows) {
      await client.query(
        "INSERT INTO club_events (id, titre, date, lieu, type, calendar_color) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          row.id,
          row.titre,
          normalizeEventDate(row.date),
          row.lieu,
          row.type,
          row.calendarColor || null,
        ],
      );
      for (const participantId of row.participants || []) {
        if (!participantId) {
          continue;
        }
        await client.query(
          "INSERT INTO club_event_participants (event_id, player_id) VALUES ($1,$2)",
          [row.id, participantId],
        );
      }
    }
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[PUT /api/club/events]", err.message);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? err.message : "Erreur sauvegarde evenements.",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
