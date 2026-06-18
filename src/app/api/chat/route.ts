/**
 * POST /api/chat
 * Streaming AI roast companion chat powered by NVIDIA Nemotron.
 * Returns a ReadableStream of text chunks for real-time typewriter reveal.
 */

import { NextRequest } from "next/server";
import { getNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import { buildSystemPrompt, buildChatContextPrompt } from "@/lib/prompts";
import { validateChatRequest } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sanitizeUserInput } from "@/lib/sanitize";

const MOCK_RESPONSES = [
  "okay so I see you're checking in — love the accountability era you're entering 👀 ngl your footprint has been... a choice lately. But you're HERE, logging, which is genuinely the first step. 💡 Tip: Next time you're about to order delivery, give cooking at home a shot — saves 0.5kg per meal!",
  "bestie I'm proud of you for even opening this app rn 🌱 most people just vibe and let the planet cook. You're actually trying to track it. That's main character energy. 💡 Tip: Start with one meatless day this week — it's the highest-impact single swap you can make.",
  "no cap, asking me for help is literally the smartest thing you've done today 😭 Let's figure out where your footprint is coming from and get you on a better path. 💡 Tip: Check your category breakdown — your biggest category is where the real wins hide.",
];

/** Returns a mock streaming response for demo mode */
async function* mockStream(message: string): AsyncGenerator<string> {
  const lower = message.toLowerCase();
  let response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] ?? MOCK_RESPONSES[0]!;
  if (lower.includes("food") || lower.includes("eat") || lower.includes("meat")) {
    response = "ah yes, the food category — the sneaky villain of carbon footprints 🥩 Beef alone produces 60x more CO2 than lentils. The audacity of a burger to be that delicious AND that destructive. 💡 Tip: Try swapping beef for chicken this week — same protein, 10x less CO2.";
  } else if (lower.includes("transport") || lower.includes("car") || lower.includes("drive")) {
    response = "the car situation is giving... concerning 🚗 Every km you drive is 0.192kg of CO2 quietly being added to the atmosphere. But hey — you're aware of it now, which is more than most. 💡 Tip: One bus day per week saves 2kg+ CO2. Think of it as a podcast catch-up session.";
  }

  const words = response.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise((r) => setTimeout(r, 30));
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const sessionId = request.headers.get("x-session-id") ?? "anonymous";
  const rateLimitResult = checkRateLimit(sessionId);

  if (!rateLimitResult.allowed) {
    return new Response("Rate limit exceeded. Try again in a minute.", { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const validation = validateChatRequest(body);
  if (!validation.valid || !validation.data) {
    return new Response(validation.error ?? "Invalid request", { status: 400 });
  }

  const { messages, currentFootprint, recentActivities } = validation.data;

  // Sanitize all user messages
  const sanitizedMessages = messages.map((m) => ({
    role: m.role,
    content: m.role === "user" ? sanitizeUserInput(m.content, 500) : m.content,
  }));

  const contextPrompt = buildChatContextPrompt(currentFootprint, recentActivities);
  const lastUserMessage = sanitizedMessages.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";

  // Demo mode
  if (!process.env["NVIDIA_API_KEY"]) {
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of mockStream(lastUserMessage)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Demo-Mode": "true" },
    });
  }

  try {
    const client = getNvidiaClient();
    const aiStream = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: `${buildSystemPrompt()}\n\n${contextPrompt}` },
        ...sanitizedMessages,
      ],
      stream: true,
      temperature: 0.9,
      max_tokens: 1024,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of aiStream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(`AI chat failed: ${errorMsg}`, { status: 500 });
  }
}
