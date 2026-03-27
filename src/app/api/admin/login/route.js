import { NextResponse } from "next/server";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("@/server/db");
const { logConnexion } = require("@/server/logger");

export const runtime = "nodejs";

export async function POST(request) {
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

  try {
    const { rows } = await db.query(
      "SELECT * FROM admin_users WHERE email = $1 AND actif = TRUE",
      [email],
    );

    const user = rows[0];

    if (!user) {
      await logConnexion({ emailUtilise: email, ip, userAgent, succes: false });
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const passwordOk = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);

    if (!passwordOk) {
      await logConnexion({
        userId: user.id,
        emailUtilise: email,
        ip,
        userAgent,
        succes: false,
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
      emailUtilise: email,
      ip,
      userAgent,
      succes: true,
    });

    return NextResponse.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[POST /api/admin/login]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
