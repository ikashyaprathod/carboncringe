/**
 * POST /api/personalize
 * Takes the user's emissions breakdown, ranks the 22 actions library,
 * and attaches AI-generated GenZ-style reasons for each recommendation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import { buildSystemPrompt, buildPersonalizationPrompt } from "@/lib/prompts";
import { ACTIONS_LIBRARY } from "@/utils/constants";
import { checkRateLimit } from "@/lib/rate-limiter";
import type { FootprintBreakdown } from "@/types";

interface PersonalizeResponseItem {
  id: string;
  reason: string;
}

/**
 * Personalizes the action recommendations for a user based on their carbon breakdown.
 *
 * @param request - NextRequest object containing the carbon footprint breakdown
 * @returns NextResponse containing ranked actions with customized reasons
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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { breakdown } = body as { breakdown: FootprintBreakdown };

  if (!breakdown || typeof breakdown !== "object") {
    return NextResponse.json({ error: "breakdown field is required and must be an object" }, { status: 400 });
  }

  // Ensure all categories are defined as numbers
  const categories: (keyof FootprintBreakdown)[] = ["transport", "food", "energy", "shopping"];
  for (const cat of categories) {
    if (typeof breakdown[cat] !== "number") {
      return NextResponse.json({ error: `breakdown.${cat} must be a number` }, { status: 400 });
    }
  }

  // If there is no NVIDIA_API_KEY, use a simple client-side ranking fallback (highest emission category first)
  if (!process.env["NVIDIA_API_KEY"]) {
    const sortedCategories = [...categories].sort((a, b) => (breakdown[b] || 0) - (breakdown[a] || 0));
    const ranked = [...ACTIONS_LIBRARY].sort((a, b) => {
      const indexA = sortedCategories.indexOf(a.category);
      const indexB = sortedCategories.indexOf(b.category);
      return indexA - indexB;
    });

    const items: PersonalizeResponseItem[] = ranked.map((act) => {
      const reasons: Record<string, string> = {
        transport: "vibe check: transport emissions are literal main character behavior, let's fix it 🚗",
        food: "no cap, meat and delivery are bloating your carbon wallet big time 🥗",
        energy: "your home appliances are giving major coal-fired grid energy 🔌",
        shopping: "fast fashion and delivery orders? the absolute carbon audacity 👗",
      };
      return {
        id: act.id,
        reason: reasons[act.category] || "small swaps add up to a major climate flex ✨",
      };
    });

    return NextResponse.json({ rankedActions: items });
  }

  try {
    const client = getNvidiaClient();
    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildPersonalizationPrompt(breakdown, ACTIONS_LIBRARY) },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";

    // Extract JSON array from the response in case of wrapping formatting
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch || !jsonMatch[0]) {
      throw new Error("Could not find JSON array in completions response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as PersonalizeResponseItem[];
    
    // Ensure all items exist in the library
    const validIds = new Set(ACTIONS_LIBRARY.map((a) => a.id));
    const filtered = parsed.filter((item) => validIds.has(item.id));

    // Pad with any remaining actions that weren't ranked by the AI
    const rankedIds = new Set(filtered.map((item) => item.id));
    const unranked = ACTIONS_LIBRARY.filter((act) => !rankedIds.has(act.id)).map((act) => ({
      id: act.id,
      reason: "Small steps compile into major wins bestie ✨",
    }));

    const finalRanked = [...filtered, ...unranked];
    return NextResponse.json({ rankedActions: finalRanked });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Fallback to static ranking in case of API complete error
    const sortedCategories = [...categories].sort((a, b) => (breakdown[b] || 0) - (breakdown[a] || 0));
    const ranked = [...ACTIONS_LIBRARY].sort((a, b) => {
      const indexA = sortedCategories.indexOf(a.category);
      const indexB = sortedCategories.indexOf(b.category);
      return indexA - indexB;
    });

    const items: PersonalizeResponseItem[] = ranked.map((act) => ({
      id: act.id,
      reason: `Analysis complete: prioritizing your ${act.category} swaps for an eco glow-up.`,
    }));

    return NextResponse.json({ rankedActions: items, note: `API Fallback triggered: ${msg}` });
  }
}
