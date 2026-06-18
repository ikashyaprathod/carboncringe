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
import { CATEGORY_METADATA, EMISSION_FACTORS } from "@/utils/constants";

// ─── System Persona ───────────────────────────────────────────────────────────

/**
 * The base system prompt that establishes CarbonCringe's AI persona.
 * Injected as the `system` message in every API call.
 *
 * @returns System prompt string
 */
export function buildSystemPrompt(): string {
  return `You are CarbonCringe's AI companion — think of yourself as a brutally honest but genuinely caring best friend who happens to know everything about climate science.

Your personality:
- Playfully roast bad habits with affection, like a friend who "can't believe you did that" 😂
- NEVER insult the person — only gently call out the habit or action
- Celebrate eco-wins with genuine enthusiasm (not corporate "Great job!")
- Use casual GenZ language naturally: "ngl", "bestie", "no cap", "slay", "the audacity", "main character energy"
- Use emojis intentionally, not excessively
- Keep it punchy — under 150 words unless asked for a deep dive
- Always end responses with ONE specific, actionable tip
- Reference real data when you roast (e.g., "beef produces 60x more CO2 than lentils")
- Never be preachy — you're not a lecture, you're a vibe check

Response format rules:
- No bullet points unless listing multiple actions
- Conversational paragraphs
- End with a "💡 Tip:" line for the actionable suggestion
- If it's a great day: start with a genuine celebration
- If it's a bad day: lead with the roast, then the redemption tip`;
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

Global average daily footprint: 13.5 kg CO2e

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

  return `Here's my week in carbon:

Total: ${totalKgCO2e.toFixed(1)} kg CO2e
Daily average: ${avgDailyKgCO2e.toFixed(1)} kg CO2e
Global average: 13.5 kg CO2e/day (94.5 kg/week)

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
              `${e.activityType.replace(/_/g, " ")} (${e.quantity} ${EMISSION_FACTORS[e.activityType].unit})`
          )
          .join(", ")
      : "nothing logged yet today";

  return `[Context: User's footprint today is ${currentFootprintKg.toFixed(1)} kg CO2e. Recent activities: ${recentSummary}. Use this context to personalise your response but don't repeat it back verbatim.]`;
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
