import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// DELETE /api/admin/orders/delete — permanently delete an order
export async function DELETE(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId manquant." }, { status: 400 });
    }

    // 1. Delete commande_items first (cascade safety)
    const { error: itemsError } = await supabaseAdmin
      .from("commande_items")
      .delete()
      .eq("commande_id", orderId);

    if (itemsError) {
      console.warn("[delete order items warning]", itemsError.message);
    }

    // 2. Delete the order from commandes table
    const { error: cmdError } = await supabaseAdmin
      .from("commandes")
      .delete()
      .eq("id", orderId);

    if (cmdError) {
      console.error("[delete order error]", cmdError.message);
      return NextResponse.json({ error: cmdError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete order exception]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur interne de suppression" },
      { status: 500 }
    );
  }
}
