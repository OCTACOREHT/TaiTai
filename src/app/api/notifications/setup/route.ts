import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET() {
  try {
    // Vérifier si la table notifications existe
    const { error: checkError } = await supabase
      .from("notifications")
      .select("count")
      .limit(1);

    // Si la table existe, retourner succès
    if (!checkError) {
      return NextResponse.json({ 
        success: true, 
        message: "Table notifications existe déjà" 
      });
    }

    // Créer la table si elle n'existe pas
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('order', 'comment', 'stock_critical', 'stock_low')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_read_created 
        ON public.notifications(read, created_at DESC);
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (createError) {
      // Si la fonction RPC n'existe pas, essayer avec une requête SQL directe
      console.log("Tentative de création via SQL direct...");
      
      // Pour Supabase, on ne peut pas exécuter du SQL directement depuis le client
      // On doit donc demander à l'utilisateur d'exécuter le script manuellement
      return NextResponse.json({ 
        success: false, 
        message: "La table notifications n'existe pas. Veuillez exécuter le script database/create-notifications-table.sql dans Supabase SQL Editor.",
        needsSetup: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Table notifications créée avec succès" 
    });

  } catch (error) {
    console.error("Erreur lors de la vérification/création de la table notifications:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erreur serveur",
      needsSetup: true 
    });
  }
}