import type { Context, Next } from "hono";

interface PrivyJwksKey {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
}

interface JwksCache {
  keys: PrivyJwksKey[];
  fetchedAt: number;
}

let jwksCache: JwksCache | null = null;
const JWKS_CACHE_TTL = 3600_000; // 1 hour

async function getJwks(appId: string): Promise<PrivyJwksKey[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }

  const res = await fetch(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`);
  if (!res.ok) {
    throw new Error("Failed to fetch Privy JWKS");
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const data = (await res.json()) as { keys: PrivyJwksKey[] };
  jwksCache = { keys: data.keys, fetchedAt: Date.now() };
  return jwksCache.keys;
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function base64UrlToBase64(str: string): string {
  return str.replace(/-/g, "+").replace(/_/g, "/");
}

async function importKey(jwk: PrivyJwksKey): Promise<CryptoKey> {
  if (jwk.kty === "EC" && jwk.crv === "P-256" && jwk.x && jwk.y) {
    // ES256 (ECDSA P-256)
    return crypto.subtle.importKey(
      "jwk",
      {
        kty: jwk.kty,
        crv: jwk.crv,
        x: base64UrlToBase64(jwk.x),
        y: base64UrlToBase64(jwk.y),
        ext: true,
      },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
  }
  // RS256 (RSA) fallback
  if (!jwk.n || !jwk.e) {
    throw new Error("Invalid JWK: missing n or e for RSA key");
  }
  return crypto.subtle.importKey(
    "jwk",
    {
      kty: jwk.kty,
      n: base64UrlToBase64(jwk.n),
      e: base64UrlToBase64(jwk.e),
      alg: jwk.alg,
      ext: true,
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

async function verifyJwt(
  token: string,
  keys: PrivyJwksKey[],
  expectedAud?: string,
): Promise<{ sub: string; [key: string]: unknown }> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // Decode header to get kid
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const header = JSON.parse(atob(base64UrlToBase64(headerB64))) as {
    alg: string;
    kid: string;
    typ: string;
  };

  if (header.alg !== "RS256" && header.alg !== "ES256") {
    throw new Error(`Unsupported algorithm: ${header.alg}`);
  }

  // Find the key
  const key = keys.find((k) => k.kid === header.kid);
  if (!key) {
    throw new Error(`Key not found for kid: ${header.kid}`);
  }

  // Verify signature
  const cryptoKey = await importKey(key);
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);

  let valid: boolean;
  if (header.alg === "ES256") {
    valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      cryptoKey,
      signature,
      signedData,
    );
  } else {
    valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signature,
      signedData,
    );
  }
  if (!valid) {
    throw new Error("Invalid JWT signature");
  }

  // Decode payload
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const payload = JSON.parse(atob(base64UrlToBase64(payloadB64))) as {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    [key: string]: unknown;
  };

  // Verify expiry
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("JWT expired");
  }

  // Verify issuer
  if (payload.iss !== "privy.io") {
    throw new Error(`Invalid issuer: ${payload.iss}`);
  }

  // Verify audience (app ID)
  if (expectedAud && payload.aud !== expectedAud) {
    throw new Error(`Invalid audience: ${payload.aud}`);
  }

  return payload;
}

// oxlint-disable-next-line typescript/consistent-return
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const appId = c.env.PRIVY_APP_ID;
    if (!appId) throw new Error("PRIVY_APP_ID not configured");

    const keys = await getJwks(appId);
    const claims = await verifyJwt(token, keys, appId);

    // Attach user ID to context
    c.set("userId", claims.sub);

    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token verification failed";
    console.error("[Auth]", message, err);
    return c.json({ error: message }, 401);
  }
}

export function getUserId(c: Context): string {
  const userId = c.get("userId");
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}
