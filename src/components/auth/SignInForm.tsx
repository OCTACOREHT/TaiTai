"use client";

import { setAdminSession } from "@/lib/admin-auth";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    setNextPath(next || "/dashboard");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          mot_de_passe: password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setSubmitting(false);
        setError(payload.error || "Connexion impossible.");
        return;
      }

      setAdminSession(
        {
          token: payload.token,
          user: {
            id: String(payload.user.id),
            name: payload.user.nom || payload.user.email,
            email: payload.user.email,
            password: "",
            role: payload.user.role,
            title: "Administration",
            avatar: "/images/user/owner.jpg",
            bio: "",
            active: true,
            lastLoginAt: new Date().toISOString(),
          },
        },
        remember,
      );
    } catch (err) {
      setSubmitting(false);
      setError("Connexion API impossible.");
      return;
    }

    window.location.href = nextPath;
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Connexion CMS
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connectez-vous pour gerer les articles, stages, partenaires et contenus du site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="admin@fctoro.cms"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pr-11 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">Garder la session ouverte</span>
            <button
              type="button"
              onClick={() => setRemember((value) => !value)}
              className={`relative h-6 w-11 rounded-full transition ${
                remember ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  remember ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>

          {error ? (
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          La creation de comptes se fait depuis le module Equipe editoriale du CMS.
        </p>
      </div>
    </div>
  );
}
