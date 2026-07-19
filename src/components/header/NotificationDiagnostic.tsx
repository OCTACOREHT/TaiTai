"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function NotificationDiagnostic() {
  const [status, setStatus] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      console.log("🔍 Test de connexion Supabase...");
      
      // Test 1: Vérifier la configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log("URL:", supabaseUrl);
      console.log("Key:", supabaseKey ? "✅ Configurée" : "❌ Manquante");

      // Test 2: Tenter une requête simple
      const startTime = Date.now();
      const { data, error } = await supabase
        .from("commandes")
        .select("count")
        .limit(1);
      const duration = Date.now() - startTime;

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        setStatus({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } else {
        console.log(`✅ Connexion OK (${duration}ms)`);
        setStatus({
          success: true,
          duration,
          data,
        });
      }
    } catch (error) {
      console.error("❌ Erreur critique:", error);
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  // Ne pas afficher en production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-bold text-white shadow-lg"
      >
        🔍 Diagnostic Supabase
      </button>

      {showDetails && (
        <div className="mt-2 w-[500px] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
          <h3 className="mb-3 text-sm font-black text-gray-900">État de la connexion Supabase</h3>
          
          <div className="space-y-2 text-xs">
            <div>
              <strong>Status:</strong>
              <span className={`ml-2 ${status?.success ? "text-green-600" : "text-red-600"}`}>
                {status?.success ? "✅ Connecté" : "❌ Déconnecté"}
              </span>
            </div>

            {status?.duration && (
              <div>
                <strong>Latence:</strong> {status.duration}ms
              </div>
            )}

            {status?.error && (
              <div className="rounded bg-red-50 p-2">
                <strong>Erreur:</strong>
                <p className="mt-1 text-red-700">{status.error}</p>
                {status.code && <p className="mt-1 text-red-600">Code: {status.code}</p>}
                {status.hint && <p className="mt-1 text-red-600">Hint: {status.hint}</p>}
              </div>
            )}

            <button
              onClick={checkSupabaseConnection}
              className="w-full rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white hover:bg-blue-600"
            >
              🔄 Re-tester la connexion
            </button>

            <div className="rounded bg-yellow-50 p-2 text-yellow-800">
              <strong>💡 Si la connexion échoue :</strong>
              <ol className="mt-1 list-inside list-decimal space-y-1">
                <li>Vérifiez votre connexion internet</li>
                <li>Vérifiez les variables d'environnement dans .env.local</li>
                <li>Vérifiez que Supabase est bien configuré</li>
                <li>Redémarrez le serveur de développement</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}