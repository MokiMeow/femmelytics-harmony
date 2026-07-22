import {
  boundedRecords,
  boundedString,
  corsHeaders,
  hasBearerToken,
  isRecord,
  jsonResponse,
  readJsonBody,
} from "../_shared/http.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function countBy(records: Record<string, unknown>[], key: string): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const record of records) {
    const value = boundedString(record[key], 80);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

function average(records: Record<string, unknown>[], key: string): number | null {
  const values = records
    .map((record) => record[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function buildReportPrompt(reportData: Record<string, unknown>): string {
  const lines = ["Create a concise health-tracking summary for review with a healthcare professional."];
  const cycleData = boundedRecords(reportData.cycleData, 366);
  const symptomData = boundedRecords(reportData.symptomsData, 366);
  const moodData = boundedRecords(reportData.moodData, 366);
  const medications = boundedRecords(reportData.medicationsData, 100);

  const periodDays = cycleData.filter((entry) => entry.flow_intensity !== "none").length;
  if (cycleData.length) lines.push(`Cycle entries: ${cycleData.length}; recorded period days: ${periodDays}.`);

  const commonSymptoms = countBy(symptomData, "symptom_type").slice(0, 5);
  if (commonSymptoms.length) {
    lines.push(`Most frequently recorded symptoms: ${commonSymptoms.map(([name, count]) => `${name} (${count})`).join(", ")}.`);
  }

  const averageMood = average(moodData, "mood_score");
  const averageEnergy = average(moodData, "energy_score");
  if (averageMood !== null) lines.push(`Average mood score: ${averageMood.toFixed(1)} out of 5.`);
  if (averageEnergy !== null) lines.push(`Average energy score: ${averageEnergy.toFixed(1)} out of 5.`);

  if (medications.length) {
    const names = medications
      .map((medication) => boundedString(medication.name, 100))
      .filter((name): name is string => Boolean(name))
      .slice(0, 20);
    lines.push(`Active medications tracked: ${medications.length}${names.length ? ` (${names.join(", ")})` : ""}.`);
  }

  lines.push("Describe patterns without diagnosing, prescribing, or inventing facts. Use plain clinical language, 150–250 words, and state when the supplied data is insufficient.");
  return lines.join("\n");
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return jsonResponse(request, { error: "Method not allowed." }, 405);
  if (!hasBearerToken(request)) return jsonResponse(request, { error: "Authentication required." }, 401);
  if (!OPENAI_API_KEY) return jsonResponse(request, { error: "Report summaries are not configured." }, 503);

  try {
    const body = await readJsonBody(request, 128 * 1024);
    if (!isRecord(body) || !isRecord(body.reportData)) {
      return jsonResponse(request, { error: "A reportData object is required." }, 400);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You summarize user-supplied health tracking data without giving medical advice." },
          { role: "user", content: buildReportPrompt(body.reportData) },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI report summary request failed", { status: response.status });
      return jsonResponse(request, { error: "Report summary generation is temporarily unavailable." }, 502);
    }

    const result = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
    const summary = boundedString(result.choices?.[0]?.message?.content, 4_000);
    return summary
      ? jsonResponse(request, { summary })
      : jsonResponse(request, { error: "The summary service returned an invalid response." }, 502);
  } catch (error) {
    if (error instanceof RangeError) return jsonResponse(request, { error: error.message }, 413);
    if (error instanceof SyntaxError) return jsonResponse(request, { error: error.message }, 400);
    console.error("Report summary request failed", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse(request, { error: "Report summary generation failed." }, 500);
  }
});
