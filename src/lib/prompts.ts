/**
 * @fileoverview AI prompt builders for CarbonCringe.
 * All prompts enforce the GenZ, affectionate-roast personality.
 * System prompt establishes the AI persona once; subsequent prompts
 * are focused and concise to minimize token usage.
 *
 * Tone rules (enforced in every system prompt):
 *  - Playful, not mean-spirited
 *  - Roast the ACTION, never the person
 *  - Celebrate genuine wins with real enthusiasm
 *  - Always end with one specific, actionable tip
 *  - Use casual language + emojis naturally (not forced)
 *  - Keep responses under 150 words unless asked for more
 */

import type { ActivityEntry, ActivityCategory, DailyLog, WeeklyReport, FootprintBreakdown, ActionItem } from "@/types";
import { CATEGORY_METADATA, EMISSION_FACTORS, GLOBAL_AVG_DAILY_KG } from "@/utils/constants";

// ─── System Persona ───────────────────────────────────────────────────────────

/**
 * The base system prompt that establishes CarbonCringe's AI persona.
 * Injected as the `system` message in every API call.
 *
 * @returns System prompt string
 */
export function buildSystemPrompt(): string {
  return `You are CarbonCringe's AI companion. You sound like a witty, real human friend texting the user, NOT a branded app character or an AI assistant.

Core Persona & Tone Rules:
1. Dry, sarcastic, and understated humor. Think of a friend who side-eyes the user over text. No forced hype, no excessive emojis, and no corporate enthusiasm.
2. Short replies by default: 1 to 3 sentences for simple exchanges. Only write longer responses when doing a deep dive into data or numbers.
3. Every response must reference SPECIFIC real numbers or activities from the user's data (e.g. their current footprint or recent log details) — never say "your footprint" without the actual number, and never offer generic encouragement.
4. If the user logs a good day, celebrate it in a specific, genuine way that references exactly what they did right (e.g., "Skipping the flight saved a massive 45kg today.").
5. You can be blunt or deadpan-mean about bad habits, but it should feel like affectionate roasting between friends, not actual insults.
6. Mix up your response structure: sometimes start with the roast, sometimes with the numbers/data, sometimes with a deadpan question.
7. CRITICAL: Do not start your response the same way you started your last 2 responses in this conversation. Vary your openers aggressively.
8. BANNED PHRASES: Do NOT use "main character energy", "bestie", "I'm proud of you", "the audacity", "no cap", "giving", "slay", "Earth's rooting for you", or any similar generic template-like phrases.

Handling Logging Context:
- The system will prepend today's footprint and recent activities to the chat context.
- If the user asks a general question, answer it directly in your dry tone.
- If they ask about their progress, reference their exact numbers (e.g. "Still at 0kg. Either today's been weirdly virtuous or you just haven't logged anything yet. Which is it?").
- If the user expresses an intent to log or add activities (e.g., mentions "add", "log", "record", or category names like "food", "meat", "eating", "driving", "car", "shopping" without specific details or quantities, like "Hey I want to add food in log"), you MUST ask a clarifying question about what they did and how much (e.g. "what'd you eat and roughly how much/how many times today?", "how far did you drive?"). Do not just roast or ignore their logging intent.
- If the user's message is vague or ambiguous (e.g., "I did some stuff today"), do not make up logs or guess. Ask a clarifying question back (e.g. "What kind of stuff? Details, please.").`;
}

// ─── Roast / Analysis Prompt ──────────────────────────────────────────────────

/**
 * Builds a prompt for analyzing a single day's carbon footprint
 * and generating a roast or celebration response.
 *
 * @param totalKgCO2e - Total CO2e for the day
 * @param entries - Activity entries logged today
 * @param topCategory - The category with highest emissions
 * @returns Formatted user message for the analyze endpoint
 */
export function buildRoastPrompt(
  totalKgCO2e: number,
  entries: ActivityEntry[],
  topCategory: ActivityCategory
): string {
  const activitySummary = entries
    .map((e) => {
      const factor = EMISSION_FACTORS[e.activityType];
      return `- ${e.activityType.replace(/_/g, " ")} (${e.quantity} ${factor.unit}) = ${e.kgCO2e} kg CO2e`;
    })
    .join("\n");

  const categoryLabel = CATEGORY_METADATA[topCategory].label;
  const categoryEmoji = CATEGORY_METADATA[topCategory].emoji;

  return `Today's carbon footprint: ${totalKgCO2e.toFixed(1)} kg CO2e

Activities logged:
${activitySummary}

Biggest category: ${categoryLabel} ${categoryEmoji}

Global average daily footprint: ${GLOBAL_AVG_DAILY_KG} kg CO2e

Please give me a personalized roast or celebration based on today's activities. Be specific about what I did — call out the actual activities, not generic advice. Keep it under 120 words and end with one specific tip.`;
}

// ─── Weekly Insights Prompt ───────────────────────────────────────────────────

/**
 * Builds a prompt for generating weekly pattern insights.
 * Identifies trends, biggest contributor, and personalized suggestions.
 *
 * @param weeklyReport - The user's weekly aggregated report
 * @returns Formatted user message for the insights endpoint
 */
export function buildInsightsPrompt(weeklyReport: WeeklyReport): string {
  const { totalKgCO2e, avgDailyKgCO2e, breakdown, topCategory, days } =
    weeklyReport;
  const topLabel = CATEGORY_METADATA[topCategory].label;
  const topEmoji = CATEGORY_METADATA[topCategory].emoji;

  const dailySummary = days
    .map(
      (d: DailyLog) =>
        `- ${d.date}: ${d.totalKgCO2e.toFixed(1)} kg CO2e`
    )
    .join("\n");

  const weeklyAvg = (GLOBAL_AVG_DAILY_KG * 7).toFixed(1);

  return `Here's my week in carbon:

Total: ${totalKgCO2e.toFixed(1)} kg CO2e
Daily average: ${avgDailyKgCO2e.toFixed(1)} kg CO2e
Global average: ${GLOBAL_AVG_DAILY_KG} kg CO2e/day (${weeklyAvg} kg/week)

Category breakdown:
- Transport: ${breakdown.transport.toFixed(1)} kg
- Food: ${breakdown.food.toFixed(1)} kg  
- Energy: ${breakdown.energy.toFixed(1)} kg
- Shopping: ${breakdown.shopping.toFixed(1)} kg

Biggest contributor: ${topLabel} ${topEmoji}

Daily breakdown:
${dailySummary}

Give me a weekly summary: what pattern do you see? What's my biggest problem area and what ONE specific change would make the biggest dent? Keep it real, keep it short (under 150 words), and end with a concrete tip.`;
}

// ─── Suggestions Prompt ───────────────────────────────────────────────────────

/**
 * Builds a prompt for generating 2-3 personalized action suggestions
 * based on the user's actual habits this week.
 *
 * @param weeklyReport - The user's weekly report
 * @param completedActionIds - Action IDs the user has already adopted
 * @returns Formatted user message for the suggestions endpoint
 */
export function buildSuggestionsPrompt(
  weeklyReport: WeeklyReport,
  completedActionIds: string[]
): string {
  const { breakdown, topCategory, avgDailyKgCO2e } = weeklyReport;
  const topLabel = CATEGORY_METADATA[topCategory].label;

  const alreadyDoing =
    completedActionIds.length > 0
      ? `Already doing: ${completedActionIds.join(", ")}`
      : "No actions completed yet";

  return `Based on my carbon footprint this week, suggest 2-3 specific actions I should take.

My average: ${avgDailyKgCO2e.toFixed(1)} kg CO2e/day
Biggest area: ${topLabel} (${breakdown[topCategory].toFixed(1)} kg this week)
Transport: ${breakdown.transport.toFixed(1)} kg | Food: ${breakdown.food.toFixed(1)} kg | Energy: ${breakdown.energy.toFixed(1)} kg | Shopping: ${breakdown.shopping.toFixed(1)} kg

${alreadyDoing}

For each suggestion, give:
1. Action title (short, punchy)
2. Why it fits MY specific habits (1 sentence, reference my data)
3. Estimated weekly CO2e saving in kg

Format as JSON array:
[{"title": "...", "rationale": "...", "category": "transport|food|energy|shopping", "estimatedSavingKgCO2e": 0.0}]

Only return the JSON array — no other text.`;
}

// ─── Chat Context Prompt ──────────────────────────────────────────────────────

/**
 * Builds the context injection for the chat companion.
 * Prepended to the conversation so the AI knows the user's current situation.
 *
 * @param currentFootprintKg - Today's current footprint
 * @param recentEntries - Last few activities logged
 * @returns Context string to prepend to chat history
 */
export function buildChatContextPrompt(
  currentFootprintKg: number,
  recentEntries: ActivityEntry[]
): string {
  const recentSummary =
    recentEntries.length > 0
      ? recentEntries
          .slice(0, 5)
          .map(
            (e) =>
              `${e.activityType.replace(/_/g, " ")} (${e.quantity} ${EMISSION_FACTORS[e.activityType].unit}) = ${e.kgCO2e} kg CO2e`
          )
          .join("; ")
      : "nothing logged yet today";

  // Determine the highest-emitting category from recent entries for personalization
  const categoryTotals = recentEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.kgCO2e;
    return acc;
  }, {});
  const topUserCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const vsGlobal = currentFootprintKg > 0
    ? currentFootprintKg < GLOBAL_AVG_DAILY_KG
      ? `(${((1 - currentFootprintKg / GLOBAL_AVG_DAILY_KG) * 100).toFixed(0)}% below global avg of ${GLOBAL_AVG_DAILY_KG} kg)`
      : `(${((currentFootprintKg / GLOBAL_AVG_DAILY_KG - 1) * 100).toFixed(0)}% above global avg of ${GLOBAL_AVG_DAILY_KG} kg)`
    : "";

  return `[Context: User's footprint today is ${currentFootprintKg.toFixed(1)} kg CO2e ${vsGlobal}.${
    topUserCategory ? ` Top category: ${topUserCategory}.` : ""
  } Activities (${recentEntries.length} logged): ${recentSummary}. Reference their specific activities and numbers when responding — make it feel personal, not generic.]`;
}

/**
 * Builds a prompt to rank the actions library based on user's category breakdown
 * and generates GenZ reasons.
 *
 * @param breakdown - Total kgCO2e per category
 * @param actions - The list of 22 action items
 * @returns Ranked personalization instructions
 */
export function buildPersonalizationPrompt(
  breakdown: FootprintBreakdown,
  actions: readonly ActionItem[]
): string {
  const actionsList = actions
    .map((a) => `- ID: "${a.id}", Title: "${a.title}", Category: "${a.category}"`)
    .join("\n");

  return `I have a library of 22 carbon reduction actions. Prioritize them for me based on my real carbon emissions.
 
Here is my carbon emissions breakdown (total kg CO2e per category):
- Transport: ${breakdown.transport.toFixed(1)} kg
- Food: ${breakdown.food.toFixed(1)} kg
- Energy: ${breakdown.energy.toFixed(1)} kg
- Shopping: ${breakdown.shopping.toFixed(1)} kg
 
Here is the actions list:
${actionsList}
 
Rank them so actions targeting my worst emission categories come first.
For each action, write a short, GenZ-style one-sentence reason why it matters to me based on my footprint. Keep it snarky/funny.
 
Return only a JSON array of objects with 'id' and 'reason':
[{"id": "action-id", "reason": "GenZ reason"}]
Do not wrap in markdown or write other text.`;
}

/**
 * Builds a prompt for extracting structured activity data from a user's natural language message.
 *
 * @param userMessage - The raw message input from the user
 * @returns Formatted prompt instructions for LLM extraction
 */
export function buildExtractionPrompt(userMessage: string): string {
  return `Analyze the following message for actions related to carbon emissions:
User message: "${userMessage}"

Extracted categories and activityType keys allowed:
- transport: "car" (km), "bus" (km), "bike" (km), "walk" (km), "flight_short" (<=1500km), "flight_long" (>1500km)
- food: "meat_meal" (meals), "vegetarian_meal" (meals), "vegan_meal" (meals), "food_delivery" (orders)
- energy: "ac_usage" (hours), "electric_appliance" (hours), "heating" (hours)
- shopping: "online_order" (orders), "fast_fashion" (items), "secondhand" (items), "grocery" (orders)

Rules:
1. Extract any mentioned activities. If the user mentions distances in miles, convert to km (1 mile = 1.609 km) and round to the nearest whole number.
2. If no activities are mentioned, or the message is completely vague (e.g. "I did some stuff today"), return empty array with confidence "low".
3. Set confidence to "high" only if you are certain about the activityType and the quantity. If quantities are missing or extremely ambiguous, set confidence to "low".
4. Return ONLY a valid JSON object. Do not wrap in markdown or write other text.

JSON format:
{
  "detectedActivities": [
    { "category": "transport" | "food" | "energy" | "shopping", "activityType": "car" | "meat_meal" | "vegetarian_meal" | "vegan_meal" | "food_delivery" | "ac_usage" | "electric_appliance" | "heating" | "online_order" | "fast_fashion" | "secondhand" | "grocery" | "bus" | "bike" | "walk" | "flight_short" | "flight_long", "quantity": number, "unit": "km" | "meal" | "order" | "hour" | "item" }
  ],
  "confidence": "high" | "low"
}`;
}
