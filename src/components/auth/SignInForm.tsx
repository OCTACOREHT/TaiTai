"use client";

import { setAdminSession } from "@/lib/admin-auth";
import React, { useEffect, useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    setNextPath(next || "/dashboard");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation des identifiants demandés par l'utilisateur
    if (email === "taitai@gmail.com" && password === "1234") {
      setAdminSession(
        {
          token: "taitai-session-active",
          user: {
            id: "owner-01",
            name: "TaiTai Admin",
            email: email,
            password: "",
            role: "super_admin",
            title: "Propriétaire",
            avatar: "/images/user/owner.jpg",
            bio: "Gestionnaire principal TaiTai",
            active: true,
            lastLoginAt: new Date().toISOString(),
          },
        },
        remember,
      );

      window.location.href = nextPath;
    } else {
      setTimeout(() => {
        setError("Idantifyan yo pa kòrèk. Eseye ankò.");
        setSubmitting(false);
      }, 600);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Aksè demo TaiTai
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Konekte sa a ouvri entèfas SaaS restoran an dirèk.
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
              placeholder="demo@taitai.app"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modpas
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Modpas lib"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
          <span className="text-sm text-gray-700 dark:text-gray-300">Kenbe sesyon an ouvri</span>
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

          {error && (
            <div className="rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {submitting ? "Ap chaje..." : "Antre nan dashboard la"}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          Pa bezwen back-end isit la, entèfas la mache an mòd demonstrasyon.
        </p>
      </div>
    </div>
  );
}
