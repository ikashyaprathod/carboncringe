/**
 * POST /api/analyze
 * Analyzes a day's carbon footprint and returns an AI-generated roast/celebration.
 */

import { NextRequest, NextResponse } from "next/server";
import { getNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import { buildSystemPrompt, buildRoastPrompt } from "@/lib/prompts";
import { validateAnalyzeRequest } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limiter";
import { calculateDailyFootprint, getImpactEquivalents, getTopCategory } from "@/utils/carbonCalculator";
import { GLOBAL_AVG_DAILY_KG, LOW_IMPACT_THRESHOLD_KG } from "@/utils/constants";
import type { AnalyzeResponse, AIInsight } from "@/types";

/** Mock response for demo mode when no API key is configured */
function getMockInsight(totalKgCO2e: number): AIInsight {
  if (totalKgCO2e < LOW_IMPACT_THRESHOLD_KG) {
    return {
      headline: "okay bestie that's actually clean energy 🌱",
      explanation: `${totalKgCO2e.toFixed(1)} kg CO2e? That's below the low-impact threshold. You're literally carrying the planet rn. Most people clock ${GLOBAL_AVG_DAILY_KG} kg/day and you're out here setting records.`,
      actionableTip: "Keep this streak alive — consistency is where the real impact is 🔥",
      tone: "celebrate",
    };
  }
  return {
    headline: `ngl, ${totalKgCO2e.toFixed(1)} kg is giving... room for improvement 👀`,
    explanation: `That's ${(totalKgCO2e / GLOBAL_AVG_DAILY_KG * 100).toFixed(0)}% of the global average daily footprint. Not the worst, but we've seen better days bestie. The planet noticed.`,
    actionableTip: "Try swapping one meat meal for a veggie option tomorrow — saves ~2.3 kg CO2e instantly 💡",
    tone: totalKgCO2e > GLOBAL_AVG_DAILY_KG ? "roast" : "neutral",
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.headers.get("x-session-id") ?? "anonymous";
  const rateLimitResult = checkRateLimit(sessionId);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateLimitResult.resetInMs / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateAnalyzeRequest(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { activities } = validation.data;
  const { totalKgCO2e, breakdown } = calculateDailyFootprint(activities);
  const topCategory = getTopCategory(breakdown);
  const equivalents = getImpactEquivalents(totalKgCO2e);

  // Demo mode — no API key configured
  if (!process.env["NVIDIA_API_KEY"]) {
    return NextResponse.json<AnalyzeResponse>({
      insight: getMockInsight(totalKgCO2e),
      totalKgCO2e,
      equivalents,
    });
  }

  try {
    const client = getNvidiaClient();
    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildRoastPrompt(totalKgCO2e, activities, topCategory) },
      ],
      temperature: 0.85,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const lines = content.trim().split("\n");
    const tipLineIndex = lines.findIndex((l) => l.startsWith("💡 Tip:"));
    const headline = lines[0] ?? "";
    const tipLine = tipLineIndex > -1 ? lines[tipLineIndex] ?? "" : "";
    const explanation = lines
      .slice(1, tipLineIndex > -1 ? tipLineIndex : undefined)
      .join(" ")
      .trim();

    const insight: AIInsight = {
      headline: headline.slice(0, 120),
      explanation: explanation || content,
      actionableTip: tipLine.replace("💡 Tip:", "").trim() || "Small steps compound. Log tomorrow too!",
      tone: totalKgCO2e > GLOBAL_AVG_DAILY_KG ? "roast" : totalKgCO2e < LOW_IMPACT_THRESHOLD_KG ? "celebrate" : "neutral",
      highlightedCategory: topCategory,
    };

    return NextResponse.json<AnalyzeResponse>({ insight, totalKgCO2e, equivalents });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    const isKeyError = message.includes("NVIDIA_API_KEY");
    return NextResponse.json(
      { error: isKeyError ? "AI service not configured" : "Analysis failed. Try again." },
      { status: 500 }
    );
  }
}
