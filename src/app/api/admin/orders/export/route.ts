import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildExcel(sheetName: string, headers: string[], rows: (string | number | null)[][]): string {
  const tableHead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const tableRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head>
    <meta charset="UTF-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>${escapeHtml(sheetName)}</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines /></x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
  </head>
  <body>
    <table border="1">
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </body>
</html>`;
}

// GET /api/admin/orders/export?date=YYYY-MM-DD
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // e.g. "2026-08-20"

  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  // Fetch all non-archived, non-cancelled orders for that date
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay   = `${date}T23:59:59.999Z`;

  const { data, error } = await supabaseAdmin
    .from("commandes")
    .select(`id, numero_commande, client_nom, client_tel, client_email, adresse_livraison, canal, total, frais_livraison, statut, payment_method, notes, created_at, commande_items(nom_plat, quantite)`)
    .is("archived_at", null)
    .neq("statut", "Annulee")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = data || [];

  if (orders.length === 0) {
    // Also try archived orders for that date (they were exported after day close)
    const { data: archived } = await supabaseAdmin
      .from("commandes")
      .select(`id, numero_commande, client_nom, client_tel, client_email, adresse_livraison, canal, total, frais_livraison, statut, payment_method, notes, created_at, commande_items(nom_plat, quantite)`)
      .neq("statut", "Annulee")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: true });
    
    if (archived && archived.length > 0) {
      return buildResponse(date, archived);
    }

    return new Response("Aucune commande pour cette date.", { status: 404 });
  }

  return buildResponse(date, orders);
}

function buildResponse(date: string, orders: any[]): Response {
  const headers = [
    "N° Commande",
    "Client",
    "Téléphone",
    "Email",
    "Canal",
    "Plats",
    "Montant (HTG)",
    "Frais livraison (HTG)",
    "Total (HTG)",
    "Méthode de paiement",
    "Statut",
    "Heure",
  ];

  const rows = orders.map((o) => {
    const plats = (o.commande_items ?? [])
      .map((i: any) => `${i.quantite}x ${i.nom_plat}`)
      .join(" | ");
    const montant = Number(o.total) - Number(o.frais_livraison ?? 0);
    const heure = new Date(o.created_at).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Port-au-Prince",
    });

    return [
      o.numero_commande,
      o.client_nom,
      o.client_tel ?? "",
      o.client_email ?? "",
      o.canal ?? "",
      plats,
      montant,
      Number(o.frais_livraison ?? 0),
      Number(o.total),
      o.payment_method || "Non spécifié",
      o.statut,
      heure,
    ];
  });

  // Summary row
  const totalRevenu = orders.reduce((s, o) => s + Number(o.total), 0);
  rows.push(["", "", "", "", "", `TOTAL — ${orders.length} commande(s)`, "", "", totalRevenu, "", "", ""]);

  const dateLocale = new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const excelContent = buildExcel(`Journée du ${dateLocale}`, headers, rows);

  // BOM + content
  const bom = "\uFEFF";
  return new Response(bom + excelContent, {
    headers: {
      "Content-Type": "application/vnd.ms-excel;charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes_${date}.xls"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
