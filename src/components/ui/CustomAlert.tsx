"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type AlertType = "error" | "success" | "warning" | "info";

interface CustomAlertProps {
  message: string;
  type?: AlertType;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomAlert({ message, type = "info", isOpen, onClose }: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow the DOM to update before animating
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const icons = {
    error: <AlertCircle className="w-6 h-6" />,
    success: <CheckCircle className="w-6 h-6" />,
    warning: <AlertCircle className="w-6 h-6" />,
    info: <AlertCircle className="w-6 h-6" />,
  };

  const colors = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      text: "text-red-900",
      button: "hover:bg-red-100",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      text: "text-green-900",
      button: "hover:bg-green-100",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600",
      text: "text-amber-900",
      button: "hover:bg-amber-100",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-900",
      button: "hover:bg-blue-100",
    },
  };

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Alert Dialog */}
      <div
        className={`relative w-full max-w-md rounded-2xl border-2 ${colorScheme.bg} ${colorScheme.border} shadow-2xl transform transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 rounded-lg p-1 transition-colors ${colorScheme.button} ${colorScheme.icon}`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 pr-12">
          <div className={`flex items-start gap-4 ${colorScheme.text}`}>
            <div className={`flex-shrink-0 ${colorScheme.icon}`}>
              {icons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                {type === "error" && "Erreur"}
                {type === "success" && "Succès"}
                {type === "warning" && "Attention"}
                {type === "info" && "Information"}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className={`border-t ${colorScheme.border} px-6 py-4`}>
          <button
            onClick={onClose}
            className={`w-full rounded-xl px-4 py-3 font-bold transition-colors ${
              type === "error"
                ? "bg-red-600 text-white hover:bg-red-700"
                : type === "success"
                ? "bg-green-600 text-white hover:bg-green-700"
                : type === "warning"
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}