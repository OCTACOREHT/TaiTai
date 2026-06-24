"use client";

import { canAccessAdminPath, getDefaultAdminPath } from "@/lib/admin-access";
import { setAdminSession } from "@/lib/admin-auth";
import { getStoredTeamUsers } from "@/lib/admin-team";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const next = new URLSearchParams(window.location.search).get("next");
    setNextPath(next || "/dashboard");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const ownerUser = {
      id: "owner-01",
      name: "Ta\u00efta\u00ef Admin",
      email: normalizedEmail,
      password: "",
      role: "super_admin" as const,
      title: "Proprietaire",
      avatar: "/images/user/owner.jpg",
      bio: "Gestionnaire principal Ta\u00efta\u00ef",
      active: true,
      lastLoginAt: new Date().toISOString(),
    };
    const teamUser = getStoredTeamUsers().find(
      (user) => user.active && user.email.toLowerCase() === normalizedEmail && user.password === password,
    );
    const authenticatedUser =
      normalizedEmail === "taitai@gmail.com" && password === "1234" ? ownerUser : teamUser || null;

    if (authenticatedUser) {
      const destination = canAccessAdminPath(nextPath, authenticatedUser.role)
        ? nextPath
        : getDefaultAdminPath(authenticatedUser.role);

      setAdminSession({ token: "taitai-session-active", user: authenticatedUser }, remember);
      window.location.href = destination;
      return;
    }

    setTimeout(() => {
      setError("Identifiants incorrects. Veuillez reessayer.");
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo/tailogo.png"
            alt="Ta\u00efta\u00ef"
            width={180}
            height={72}
            priority
            className="h-auto w-44 object-contain"
          />
        </div>
        <h1 className="sr-only">Connexion Ta\u00efta\u00ef</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="taitai@gmail.com"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Mot de passe"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
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
            {submitting ? "Ouverture..." : "Entrer dans le dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
