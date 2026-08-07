import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for the Account Abstraction bundler/paymaster.
 *
 * The browser talks to this same-origin route; this route forwards the
 * JSON-RPC body to the real bundler using a SERVER-ONLY env var that carries
 * the upstream API key. The key is never sent to the browser.
 *
 * IMPORTANT: these env vars must NOT be prefixed with NEXT_PUBLIC_ — that
 * prefix would inline them into the client bundle and re-expose the key.
 */
const AA_URLS: Record<string, { prod?: string; staging?: string }> = {
  base: {
    prod: process.env.AA_BASE_URL,
    staging: process.env.AA_BASE_URL_STAGING,
  },
  baseSepolia: {
    prod: process.env.AA_BASE_SEPOLIA_URL,
    staging: process.env.AA_BASE_SEPOLIA_URL_STAGING,
  },
  radius: {
    prod: process.env.AA_RADIUS_URL,
    staging: process.env.AA_RADIUS_URL_STAGING,
  },
  radiusTestnet: {
    prod: process.env.AA_RADIUS_TESTNET_URL,
    staging: process.env.AA_RADIUS_TESTNET_URL_STAGING,
  },
};

// Methods the public frontend must never be able to reach through this proxy,
// even if a bundler ever re-enables its debug namespace.
const BLOCKED_METHODS = new Set([
  "pimlico_sendUserOperationNow",
]);

function isBlockedMethod(method: unknown): boolean {
  return (
    typeof method === "string" &&
    (method.startsWith("debug_") || BLOCKED_METHODS.has(method))
  );
}

function payloadIsBlocked(payload: unknown): boolean {
  if (Array.isArray(payload)) {
    return payload.some((p) => isBlockedMethod((p as { method?: unknown })?.method));
  }
  return isBlockedMethod((payload as { method?: unknown })?.method);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chain: string }> }
) {
  const { chain } = await params;

  const entry = AA_URLS[chain];
  if (!entry) {
    return NextResponse.json({ error: "unsupported_chain" }, { status: 400 });
  }

  const staging = req.nextUrl.searchParams.has("staging");
  const target = staging ? entry.staging : entry.prod;
  if (!target) {
    return NextResponse.json({ error: "chain_not_configured" }, { status: 500 });
  }

  const raw = await req.text();

  try {
    if (payloadIsBlocked(JSON.parse(raw))) {
      return NextResponse.json(
        { jsonrpc: "2.0", id: null, error: { code: -32601, message: "Method not allowed" } },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });
    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Log detail server-side only; never return upstream error bodies to the client.
    console.error("AA proxy upstream error:", err);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
