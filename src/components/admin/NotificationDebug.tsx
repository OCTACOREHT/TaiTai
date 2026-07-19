"use client";

import React, { useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationDebug() {
  const { notifications, unreadCount, refreshNotifications } = useNotifications();
  const [setupStatus, setSetupStatus] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const response = await fetch("/api/notifications/setup");
      const data = await response.json();
      setSetupStatus(data);
    } catch (error) {
      setSetupStatus({ success: false, message: "Erreur lors de la vérification" });
    }
  };

  const testNotification = async () => {
    try {
      await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          title: "Test notification",
          message: "Ceci est un test",
          link: "/commandes",
        }),
      });
      setTimeout(() => refreshNotifications(), 500);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Ne pas afficher en production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Afficher un indicateur simple si les notifications ne sont pas configurées
  if (!showDebug && (!setupStatus || !setupStatus.success)) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="rounded-lg border-2 border-red-500 bg-white p-4 shadow-2xl max-w-sm">
          <h3 className="mb-2 text-sm font-black text-red-600">⚠️ Notifications non configurées</h3>
          <p className="mb-3 text-xs text-gray-700">
            Les notifications ne fonctionnent pas car la table n'existe pas dans Supabase.
          </p>
          <button
            onClick={() => setShowDebug(true)}
            className="w-full rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            Voir les détails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-bold text-white shadow-lg"
      >
        🔧 Debug Notifications
      </button>

      {showDebug && (
        <div className="mt-2 w-96 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
          <h3 className="mb-3 text-sm font-black text-gray-900">Debug Notifications</h3>
          
          <div className="space-y-2 text-xs">
            <div>
              <strong>Status setup:</strong>
              <pre className="mt-1 rounded bg-gray-50 p-2 text-[10px]">
                {JSON.stringify(setupStatus, null, 2)}
              </pre>
            </div>

            <div>
              <strong>Notifications non lues: {unreadCount}</strong>
            </div>

            <div>
              <strong>Total notifications: {notifications.length}</strong>
            </div>

            <button
              onClick={checkSetup}
              className="w-full rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white hover:bg-blue-600"
            >
              Vérifier setup
            </button>

            <button
              onClick={testNotification}
              className="w-full rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white hover:bg-green-600"
            >
              Créer notification test
            </button>

            <button
              onClick={refreshNotifications}
              className="w-full rounded-lg bg-gray-500 px-3 py-2 text-xs font-bold text-white hover:bg-gray-600"
            >
              Rafraîchir
            </button>

            {notifications.length > 0 && (
              <div>
                <strong>Dernières notifications:</strong>
                <div className="mt-1 max-h-40 overflow-y-auto rounded bg-gray-50 p-2">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="border-b border-gray-200 pb-1 mb-1">
                      <div className="font-bold">{notif.title}</div>
                      <div className="text-gray-600">{notif.message}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}