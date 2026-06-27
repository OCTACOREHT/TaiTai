"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-[999999] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl dark:border-emerald-800 dark:bg-gray-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-white">Reçu envoyé</p>
        <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
      >
        <X size={14} />
      </button>
    </div>
  );
}
