import { describe, expect, it } from "vitest";

import {
  boundedRecords,
  boundedString,
  corsHeaders,
  readJsonBody,
} from "../supabase/functions/_shared/http";

describe("edge-function HTTP helpers", () => {
  it("allows the production, preview, and local application origins", () => {
    for (const origin of [
      "https://femmelytics.vercel.app",
      "https://femmelytics-git-repair-mokimeow.vercel.app",
      "http://localhost:8080",
    ]) {
      const headers = corsHeaders(new Request("https://example.test", { headers: { origin } })) as Record<string, string>;
      expect(headers["Access-Control-Allow-Origin"]).toBe(origin);
    }
  });

  it("does not grant browser access to unrelated origins", () => {
    const headers = corsHeaders(
      new Request("https://example.test", { headers: { origin: "https://attacker.example" } }),
    ) as Record<string, string>;
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("normalizes bounded strings", () => {
    expect(boundedString("  hello  ", 10)).toBe("hello");
    expect(boundedString("", 10)).toBeNull();
    expect(boundedString("too long", 3)).toBeNull();
    expect(boundedString(42, 10)).toBeNull();
  });

  it("keeps only the newest bounded records", () => {
    expect(boundedRecords([null, { id: 1 }, "invalid", { id: 2 }, { id: 3 }], 2)).toEqual([
      { id: 2 },
      { id: 3 },
    ]);
  });

  it("parses JSON and rejects oversized or invalid bodies", async () => {
    await expect(readJsonBody(new Request("https://example.test", { method: "POST", body: '{"ok":true}' }))).resolves.toEqual({ ok: true });
    await expect(readJsonBody(new Request("https://example.test", { method: "POST", body: "{" }))).rejects.toThrow(SyntaxError);
    await expect(readJsonBody(new Request("https://example.test", { method: "POST", body: "12345" }), 4)).rejects.toThrow(RangeError);
  });
});
