import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import { encryptCookieValue, decryptCookieValue } from "@/lib/cookieCrypto";

// Secure server-side store for the BO pre-consult answer set. The payload is
// AES-256-GCM encrypted (COOKIE_ENCRYPTION_KEY, server-only) and set as an
// httpOnly cookie, so the client never sees the plaintext or the key. The BO
// pre-consult is small (~0.8 KB encrypted), well under the 4 KB cookie limit.
const COOKIE = "wl_pre_data";
const TTL_MS = 1800 * 1000; // 30 min, matches the wl_* session cookies

// Share across *.myrocky.com in production; omit on localhost / *.vercel.app.
function getCookieDomain(host) {
  if (!host) return undefined;
  const hostname = host.split(":")[0];
  if (hostname === "myrocky.com" || hostname.endsWith(".myrocky.com")) {
    return "myrocky.com";
  }
  return undefined;
}

function cookieOptions(host, expires) {
  const hostname = (host || "").split(":")[0];
  const isLocal = hostname === "localhost" || hostname.startsWith("127.");
  const opts = {
    path: "/",
    expires,
    httpOnly: true,
    secure: !isLocal, // http localhost can't store Secure cookies
    sameSite: "lax",
  };
  const domain = getCookieDomain(host);
  if (domain) opts.domain = domain;
  return opts;
}

// Persist the pre-consult answers into the encrypted cookie. Password is never
// stored (stripped here as a safety net even if the client omitted it).
export async function POST(req) {
  try {
    const body = await req.json();
    const userData = { ...(body.userData || {}) };
    delete userData.password;
    const payload = {
      userData,
      selectedProduct: body.selectedProduct ?? null,
    };

    const encrypted = encryptCookieValue(JSON.stringify(payload));
    const res = NextResponse.json({ ok: true });
    res.cookies.set(
      COOKIE,
      encrypted,
      cookieOptions(req.headers.get("host"), new Date(Date.now() + TTL_MS))
    );
    return res;
  } catch (error) {
    logger.warn("pre-state set error:", error.message);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

// Clear the pre-consult cookie (quiz completed or reset).
export async function DELETE(req) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    COOKIE,
    "",
    cookieOptions(req.headers.get("host"), new Date(0))
  );
  return res;
}

// Read + decrypt the pre-consult answers for the current session.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE)?.value;
    if (!raw) return NextResponse.json({ userData: null, selectedProduct: null });

    const decrypted = decryptCookieValue(raw);
    if (!decrypted)
      return NextResponse.json({ userData: null, selectedProduct: null });

    const parsed = JSON.parse(decrypted);
    return NextResponse.json({
      userData: parsed.userData || null,
      selectedProduct: parsed.selectedProduct || null,
    });
  } catch (error) {
    logger.warn("pre-state get error:", error.message);
    return NextResponse.json({ userData: null, selectedProduct: null });
  }
}
