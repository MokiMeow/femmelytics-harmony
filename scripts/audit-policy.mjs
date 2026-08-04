import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ALLOWED_ADVISORY = "https://github.com/advisories/GHSA-qwww-vcr4-c8h2";
const ALLOWED_PACKAGES = new Set(["react-router", "react-router-dom"]);
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const RSC_USAGE = /unstable_RSC|react-router(?:-dom)?\/rsc/;

export function evaluateAudit(report, sourceTexts) {
  const reasons = [];
  const vulnerabilities = report?.vulnerabilities ?? {};

  for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
    if (!ALLOWED_PACKAGES.has(packageName)) {
      reasons.push(`Unexpected vulnerable package: ${packageName}`);
      continue;
    }

    const via = Array.isArray(vulnerability?.via) ? vulnerability.via : [];
    if (packageName === "react-router") {
      const advisoryUrls = via
        .filter((item) => item && typeof item === "object")
        .map((item) => item.url);
      if (advisoryUrls.length !== 1 || advisoryUrls[0] !== ALLOWED_ADVISORY) {
        reasons.push("React Router has an advisory outside the approved RSC-only exception");
      }
    } else if (via.length !== 1 || via[0] !== "react-router") {
      reasons.push("react-router-dom is affected by more than the approved transitive advisory");
    }
  }

  if (Object.keys(vulnerabilities).length > 0 && sourceTexts.some((source) => RSC_USAGE.test(source))) {
    reasons.push("React Router RSC usage makes GHSA-qwww-vcr4-c8h2 applicable");
  }

  return { ok: reasons.length === 0, reasons };
}

function readSourceFiles(directory) {
  const contents = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      contents.push(...readSourceFiles(path));
    } else if (SOURCE_EXTENSIONS.has(extname(entry))) {
      contents.push(readFileSync(path, "utf8"));
    }
  }
  return contents;
}

function runAudit() {
  const npmCli = process.env.npm_execpath;
  const command = npmCli ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
  const args = npmCli ? [npmCli, "audit", "--json"] : ["audit", "--json"];
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (!result.stdout) {
    console.error(result.stderr || "npm audit did not return a report");
    return 1;
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error("npm audit returned invalid JSON");
    return 1;
  }

  const evaluation = evaluateAudit(report, readSourceFiles("src"));
  if (!evaluation.ok) {
    for (const reason of evaluation.reasons) console.error(reason);
    return 1;
  }

  const total = report.metadata?.vulnerabilities?.total ?? 0;
  if (total === 0) {
    console.log("Dependency audit passed with 0 vulnerabilities.");
  } else {
    console.log("Dependency audit passed with only GHSA-qwww-vcr4-c8h2 allowed; unstable RSC APIs are not used.");
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runAudit();
}
