import { describe, expect, it } from "vitest";
import { evaluateAudit } from "../scripts/audit-policy.mjs";

const rscAdvisory = {
  source: 1124282,
  name: "react-router",
  dependency: "react-router",
  title: "React Router RSC mode CSRF bypass",
  url: "https://github.com/advisories/GHSA-qwww-vcr4-c8h2",
  severity: "high",
  range: ">=7.12.0 <8.3.0",
};

function auditReport(vulnerabilities: Record<string, unknown>) {
  return {
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: Object.keys(vulnerabilities).length,
        critical: 0,
        total: Object.keys(vulnerabilities).length,
      },
    },
  };
}

describe("dependency audit policy", () => {
  it("permits only the known React Router RSC advisory in a non-RSC SPA", () => {
    const report = auditReport({
      "react-router": { name: "react-router", via: [rscAdvisory] },
      "react-router-dom": { name: "react-router-dom", via: ["react-router"] },
    });

    expect(evaluateAudit(report, ["import { BrowserRouter } from 'react-router-dom';"])).toEqual({
      ok: true,
      reasons: [],
    });
  });

  it("rejects every additional vulnerability", () => {
    const report = auditReport({
      "react-router": { name: "react-router", via: [rscAdvisory] },
      "react-router-dom": { name: "react-router-dom", via: ["react-router"] },
      postcss: {
        name: "postcss",
        via: [{ url: "https://github.com/advisories/GHSA-unexpected" }],
      },
    });

    expect(evaluateAudit(report, [])).toEqual({
      ok: false,
      reasons: ["Unexpected vulnerable package: postcss"],
    });
  });

  it("rejects the exception when unstable React Router RSC APIs are used", () => {
    const report = auditReport({
      "react-router": { name: "react-router", via: [rscAdvisory] },
      "react-router-dom": { name: "react-router-dom", via: ["react-router"] },
    });

    expect(evaluateAudit(report, ["import { unstable_RSCHydratedRouter } from 'react-router/dom';"])).toEqual({
      ok: false,
      reasons: ["React Router RSC usage makes GHSA-qwww-vcr4-c8h2 applicable"],
    });
  });
});
