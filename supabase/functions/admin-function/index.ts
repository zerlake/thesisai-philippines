// admin-function/index.ts
console.info("admin-function starting");

function parseAuthorizationHeader(headers: Headers) {
  const auth = headers.get("authorization") ?? headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (!scheme || !token) return null;
  return { scheme: scheme.toLowerCase(), token };
}

async function tryParseJsonBody(req: Request) {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Basic (non-cryptographic) JWT decode to inspect claims.
 * This does NOT validate signature. It's for local debugging to see claims.
 * For production, use proper JWT verification or rely on `verify_jwt` platform option.
 */
function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const { pathname } = new URL(req.url);

  // Optional: restrict path to /admin-function/*
  if (!pathname.startsWith("/admin-function")) {
    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  const auth = parseAuthorizationHeader(req.headers);
  const jwtClaims = auth?.token ? decodeJwt(auth.token) : null;

  // Simple admin check (adjust claim name/value as needed)
  const isAdmin = jwtClaims && (jwtClaims.user_role === "admin" || jwtClaims.role === "admin" || jwtClaims["https://hasura.io/jwt/claims"]?.role === "admin");

  // For local testing we *show* the header + claims; in prod you may remove these details.
  const body = await tryParseJsonBody(req);

  const result = {
    ok: true,
    path: pathname,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    jwt_present: !!auth?.token,
    jwt_scheme: auth?.scheme ?? null,
    jwt_claims: jwtClaims,
    admin_check_passed: !!isAdmin,
    body,
  };

  // If you want to enforce admin-only access, uncomment next lines:
  // if (!isAdmin) {
  //   return new Response(JSON.stringify({ error: "forbidden", details: "admin role required" }), { status: 403, headers: { "Content-Type": "application/json" } });
  // }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
  });
});