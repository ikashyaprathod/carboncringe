/**
 * POST /api/suggestions
 * Returns 2-3 personalized action suggestions based on the user's weekly habits.
 */

import { NextRequest, NextResponse } from "next/server";
import { getNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import { buildSystemPrompt, buildSuggestionsPrompt } from "@/lib/prompts";
import { validateSuggestionsRequest } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limiter";
import type { SuggestionsResponse, AISuggestion } from "@/types";

const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    title: "Meatless Monday",
    rationale: "Food is your biggest category this week — one meatless day cuts it by ~2.3 kg instantly",
    category: "food",
    estimatedSavingKgCO2e: 2.3,
  },
  {
    title: "Take the bus twice this week",
    rationale: "Your transport emissions are above average — two bus days instead of driving saves 4+ kg",
    category: "transport",
    estimatedSavingKgCO2e: 4.2,
  },
  {
    title: "Raise AC temp by 2°C",
    rationale: "Energy usage is adding up — a small thermostat change saves 0.6kg per hour of use",
    category: "energy",
    estimatedSavingKgCO2e: 2.8,
  },
];

/**
 * Generates personalized daily action suggestions based on weekly usage reports.
 *
 * @param request - NextRequest object containing the SuggestionsRequest payload
 * @returns NextResponse containing suggestions or an error response
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.headers.get("x-session-id") ?? "anonymous";
  const rateLimitResult = checkRateLimit(sessionId);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateSuggestionsRequest(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { weeklyReport, completedActionIds } = validation.data;

  // Demo mode
  if (!process.env["NVIDIA_API_KEY"]) {
    return NextResponse.json<SuggestionsResponse>({ suggestions: MOCK_SUGGESTIONS });
  }

  try {
    const client = getNvidiaClient();
    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildSuggestionsPrompt(weeklyReport, completedActionIds) },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";

    // Extract JSON from response (AI sometimes wraps in markdown)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch || !jsonMatch[0]) {
      return NextResponse.json<SuggestionsResponse>({ suggestions: MOCK_SUGGESTIONS });
    }

    const parsed = JSON.parse(jsonMatch[0]) as AISuggestion[];
    const suggestions = parsed.slice(0, 3).map((s) => ({
      title: String(s.title ?? "").slice(0, 80),
      rationale: String(s.rationale ?? "").slice(0, 200),
      category: s.category ?? "food",
      estimatedSavingKgCO2e: Number(s.estimatedSavingKgCO2e) || 0,
    }));

    return NextResponse.json<SuggestionsResponse>({ suggestions });
  } catch {
    return NextResponse.json<SuggestionsResponse>({ suggestions: MOCK_SUGGESTIONS });
  }
}
