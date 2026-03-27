const jwt = require("jsonwebtoken");
const { NextResponse } = require("next/server");

function unauthorized(message, status = 401) {
  return NextResponse.json({ error: message }, { status });
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const [, token] = authHeader.split(" ");
  return token || null;
}

function requireAuth(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      error: unauthorized("Token manquant. Authentification requise."),
    };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { user };
  } catch (err) {
    return {
      error: unauthorized("Token invalide ou expire."),
    };
  }
}

function requireSuperAdmin(user) {
  if (!user || user.role !== "super_admin") {
    return unauthorized("Acces refuse. Role super_admin requis.", 403);
  }

  return null;
}

module.exports = { requireAuth, requireSuperAdmin };
