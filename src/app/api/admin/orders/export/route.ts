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
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  // Use a wide time window to accommodate UTC offset (Haiti = UTC-4/UTC-5)
  // Fetch 28 hours centred on the date to cover any timezone offset
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay   = `${date}T23:59:59.999Z`;

  // Try active (non-archived) orders first
  const { data, error } = await supabaseAdmin
    .from("commandes")
    .select(`id, numero_commande, client_nom, client_tel, canal, total, frais_livraison, statut, payment_method, created_at, commande_items(nom_plat, quantite)`)
    .is("archived_at", null)
    .neq("statut", "Annulee")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[export route error]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let orders = data || [];

  // If no active orders found, also look in archived orders for that date
  if (orders.length === 0) {
    const { data: archived, error: archErr } = await supabaseAdmin
      .from("commandes")
      .select(`id, numero_commande, client_nom, client_tel, canal, total, frais_livraison, statut, payment_method, created_at, commande_items(nom_plat, quantite)`)
      .neq("statut", "Annulee")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: true });

    if (!archErr && archived && archived.length > 0) {
      orders = archived;
    } else {
      return new Response("Aucune commande pour cette date.", { status: 404 });
    }
  }

  return buildResponse(date, orders);
}

function buildResponse(date: string, orders: any[]): Response {
  const headers = [
    "N° Commande",
    "Client",
    "Téléphone",
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
  rows.push(["", "", "", "", `TOTAL — ${orders.length} commande(s)`, "", "", totalRevenu, "", "", ""]);

  const dateLocale = new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const excelContent = buildExcel(`Journée du ${dateLocale}`, headers, rows);
  const bom = "\uFEFF";

  return new Response(bom + excelContent, {
    headers: {
      "Content-Type": "application/vnd.ms-excel;charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes_${date}.xls"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
