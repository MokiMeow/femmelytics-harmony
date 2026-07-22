const PRODUCTION_ORIGIN = "https://femmelytics.vercel.app";
const MAX_PREVIEW_ORIGIN_LENGTH = 160;

function isAllowedOrigin(origin: string): boolean {
  if (origin === PRODUCTION_ORIGIN) return true;

  try {
    const url = new URL(origin);
    if (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)) {
      return true;
    }

    return (
      origin.length <= MAX_PREVIEW_ORIGIN_LENGTH &&
      url.protocol === "https:" &&
      /^femmelytics(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  return {
    ...(origin && isAllowedOrigin(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonResponse(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json" },
  });
}

export async function readJsonBody(request: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RangeError("Request body is too large");
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw new RangeError("Request body is too large");
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new SyntaxError("Request body must be valid JSON");
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function boundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

export function boundedRecords(value: unknown, maxItems: number): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).slice(-maxItems);
}

export function hasBearerToken(request: Request): boolean {
  return /^Bearer\s+\S+$/i.test(request.headers.get("authorization") ?? "");
}
