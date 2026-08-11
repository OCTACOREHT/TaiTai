import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// DELETE /api/admin/orders/delete — permanently delete a cancelled order
export async function DELETE(request: Request) {
  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId manquant." }, { status: 400 });
  }

  // Safety check: only allow deleting cancelled orders
  const { data: order, error: fetchError } = await supabaseAdmin
    .from("commandes")
    .select("id, statut")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (order.statut !== "Annulee") {
    return NextResponse.json(
      { error: "Seules les commandes annulées peuvent être supprimées." },
      { status: 403 }
    );
  }

  // Delete commande_items first (cascade safety)
  await supabaseAdmin.from("commande_items").delete().eq("commande_id", orderId);

  // Delete the order
  const { error } = await supabaseAdmin.from("commandes").delete().eq("id", orderId);

  if (error) {
    console.error("[delete order]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
