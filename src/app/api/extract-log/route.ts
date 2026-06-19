/**
 * POST /api/extract-log
 * Service-side natural language activity extraction.
 * Parses user message to detect loggable carbon footprint activities.
 */

import { NextRequest, NextResponse } from "next/server";
import { getNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import { buildExtractionPrompt } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/rate-limiter";
import { validateExtractLogRequest } from "@/lib/validators";
import { sanitizeUserInput } from "@/lib/sanitize";
import type { ExtractedActivity, ExtractLogResponse } from "@/types";

/**
 * Local regex-based heuristic extraction for Demo Mode.
 *
 * @param text - Raw message input from user
 * @returns An ExtractLogResponse with extracted activities
 */
function heuristicExtract(text: string): ExtractLogResponse {
  const lower = text.toLowerCase();
  const detectedActivities: ExtractedActivity[] = [];

  // 1. Car driving
  // Matches "drove 20km", "drive 15 km", "driving 50km", etc.
  const carRegex = /(?:drove|drive|driving|car)\s*(\d+(?:\.\d+)?)\s*(km|miles|mile)?/i;
  const carMatch = lower.match(carRegex);
  if (carMatch && carMatch[1]) {
    let qty = parseFloat(carMatch[1]);
    const unit = carMatch[2] || "km";
    if (unit.startsWith("mile")) {
      qty = Math.round(qty * 1.609);
    }
    detectedActivities.push({
      category: "transport",
      activityType: "car",
      quantity: Math.round(qty * 10) / 10,
      unit: "km",
    });
  }

  // 2. Food delivery
  // Matches "food delivery twice", "delivered 3 times", "delivery twice", "ordered delivery twice"
  const deliveryRegex = /(?:food\s*)?(?:delivery|delivered|order\s+delivery)\s*(twice|once|(\d+)\s*(?:times|order|orders)?)/i;
  const deliveryMatch = lower.match(deliveryRegex);
  if (deliveryMatch) {
    let qty = 1;
    if (deliveryMatch[1] === "twice") {
      qty = 2;
    } else if (deliveryMatch[1] === "once") {
      qty = 1;
    } else if (deliveryMatch[2]) {
      qty = parseInt(deliveryMatch[2], 10);
    }
    detectedActivities.push({
      category: "food",
      activityType: "food_delivery",
      quantity: qty,
      unit: "order",
    });
  }

  // 3. Meat meal
  // Matches "ate meat", "had 2 meat meals", "beef burger", etc.
  const meatRegex = /(?:ate|had|ordered|eat)?\s*(\d+)?\s*(?:meat\s+meal|meat\s+meals|beef|lamb|steak|pork)/i;
  const meatMatch = lower.match(meatRegex);
  if (meatMatch) {
    const qty = meatMatch[1] ? parseInt(meatMatch[1], 10) : 1;
    detectedActivities.push({
      category: "food",
      activityType: "meat_meal",
      quantity: qty,
      unit: "meal",
    });
  }

  // 4. AC usage
  // Matches "ac for 5 hours", "air conditioning 2 hrs"
  const acRegex = /(?:ac|a\/c|air\s+conditioning)\s*(?:for\s*)?(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)/i;
  const acMatch = lower.match(acRegex);
  if (acMatch && acMatch[1]) {
    const qty = parseFloat(acMatch[1]);
    detectedActivities.push({
      category: "energy",
      activityType: "ac_usage",
      quantity: Math.round(qty * 10) / 10,
      unit: "hour",
    });
  }

  return {
    detectedActivities,
    confidence: detectedActivities.length > 0 ? "high" : "low",
  };
}

/**
 * Parses user message to extract structured carbon footprint activities.
 *
 * @param request - NextRequest object containing the ExtractLogRequest payload
 * @returns NextResponse containing ExtractLogResponse or an error response
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.headers.get("x-session-id") ?? "anonymous";
  const rateLimitResult = checkRateLimit(sessionId);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateExtractLogRequest(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json({ error: validation.error ?? "Invalid request" }, { status: 400 });
  }

  const message = sanitizeUserInput(validation.data.message, 500);

  // Demo mode fallback
  if (!process.env["NVIDIA_API_KEY"]) {
    const fallbackResponse = heuristicExtract(message);
    return NextResponse.json(fallbackResponse);
  }

  try {
    const client = getNvidiaClient();
    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: "You are a JSON-only data extraction bot." },
        { role: "user", content: buildExtractionPrompt(message) },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) {
      throw new Error("Could not find JSON object in model response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExtractLogResponse;
    const validatedActivities = (parsed.detectedActivities || []).map((act) => ({
      category: String(act.category ?? ""),
      activityType: act.activityType,
      quantity: Number(act.quantity) || 0,
      unit: String(act.unit ?? ""),
    }));

    return NextResponse.json<ExtractLogResponse>({
      detectedActivities: validatedActivities,
      confidence: parsed.confidence === "high" ? "high" : "low",
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    // If the API fails, fall back to heuristic so NL logging keeps working
    const fallbackResponse = heuristicExtract(message);
    return NextResponse.json({
      ...fallbackResponse,
      note: `API Error: ${errMsg}. Fallback triggered.`,
    });
  }
}
