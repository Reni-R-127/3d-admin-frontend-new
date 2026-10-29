
import { createHmac } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 300;

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function createAdminToken(email, secret) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    email,
    role: "admin",
    iss: "projenius-3d",
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
  };

  const unsignedToken =
    `${base64Url(JSON.stringify(header))}.` +
    `${base64Url(JSON.stringify(payload))}`;

  const signature = createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
}

// Vercel needs this exported handler.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const secret = process.env.JWT_SECRET;

  if (!email || !secret || secret.length < 32) {
    return res.status(503).json({
      message:
        "Admin token service is not configured. Check server environment variables.",
    });
  }

  try {
    const token = createAdminToken(email, secret);

    return res.status(200).json({
      token,
      expiresIn: TOKEN_LIFETIME_SECONDS,
    });
  } catch (error) {
    console.error("Admin token generation failed:", error.message);

    return res.status(500).json({
      message: "Unable to generate admin token.",
    });
  }
}
