const BASE = "https://api.digitallocker.gov.in/public/oauth2/1";

export function getDigiLockerAuthURL(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DIGILOCKER_CLIENT_ID || "demo_dev",
    redirect_uri: process.env.DIGILOCKER_REDIRECT_URI || "http://localhost:3000/api/digilocker/callback",
    scope: "openid profile",
  });
  return `${BASE}/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      grant_type: "authorization_code",
      client_id: process.env.DIGILOCKER_CLIENT_ID,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
      redirect_uri: process.env.DIGILOCKER_REDIRECT_URI,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function pushToDigiLocker(accessToken: string, ipfsCID: string, metadata: object) {
  return fetch(`${BASE}/file`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ipfs_cid: ipfsCID, metadata }),
  });
}
