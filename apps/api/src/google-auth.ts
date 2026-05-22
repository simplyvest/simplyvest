function pemToBinary(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

function base64url(input: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...input));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signRS256(data: Uint8Array, privateKeyPem: string): Promise<Uint8Array> {
  const keyData = pemToBinary(privateKeyPem);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, privateKey, data);
  return new Uint8Array(sig);
}

function createJWT(
  header: Record<string, string>,
  payload: Record<string, string | number>,
): string {
  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  return `${headerB64}.${payloadB64}`;
}

async function signJWT(unsigned: string, privateKeyPem: string): Promise<string> {
  const enc = new TextEncoder();
  const signature = await signRS256(enc.encode(unsigned), privateKeyPem);
  return `${unsigned}.${base64url(signature)}`;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsigned = createJWT(header, payload);
  const assertion = await signJWT(unsigned, privateKey);

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenResp.ok) {
    const err = await tokenResp.text();
    throw new Error(`Token exchange failed: ${tokenResp.status} ${err}`);
  }

  const tokenData = (await tokenResp.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

export async function appendToSheet(
  accessToken: string,
  sheetId: string,
  sheetName: string,
  values: string[],
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [values],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Sheets API failed: ${resp.status} ${err}`);
  }
}
