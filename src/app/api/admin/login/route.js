import { NextResponse } from "next/server";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("@/server/db");
const { logConnexion } = require("@/server/logger");

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT_SECRET manquant dans les variables d'environnement." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { email, mot_de_passe } = body;
    const ip = request.headers.get("x-forwarded-for") || "0.0.0.0";
    const userAgent = request.headers.get("user-agent") || "";

    if (!email || !mot_de_passe) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 },
      );
    }

    const { rows } = await db.query(
      "SELECT * FROM admin_users WHERE email = $1 AND active = TRUE",
      [email],
    );

    const user = rows[0];

    if (!user) {
      await logConnexion({ emailUsed: email, ip, userAgent, success: false });
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const passwordOk = await bcrypt.compare(mot_de_passe, user.password_hash);

    if (!passwordOk) {
      await logConnexion({
        userId: user.id,
        emailUsed: email,
        ip,
        userAgent,
        success: false,
      });
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );

    await logConnexion({
      userId: user.id,
      emailUsed: email,
      ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[POST /api/admin/login]", err.message);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" ? err.message : "Erreur serveur.",
      },
      { status: 500 },
    );
  }
}
