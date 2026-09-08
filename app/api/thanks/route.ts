import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

const MODEL_ID = "gemini-2.0-flash";

type ThanksRequestBody = {
  donorName?: unknown;
  amount?: unknown;
  impact?: unknown;
};

const FALLBACK_MESSAGES = [
  "Thank you for standing with survivors tonight, {donor}. Your gift of ${amount} turns into real shelter, real safety, real hope.",
  "{donor}, because of you, a family gets one more safe night. ${amount} goes straight to the people who need it most.",
  "Every dollar counts, and yours just counted for someone in crisis, {donor}. ${amount} well spent on courage.",
];

function buildFallbackMessage(donorName: string, amount: number): string {
  const index = Math.abs(hashString(donorName + amount)) % FALLBACK_MESSAGES.length;
  return FALLBACK_MESSAGES[index]
    .replace("{donor}", donorName)
    .replace("{amount}", String(amount));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function parseBody(raw: ThanksRequestBody): { donorName: string; amount: number; impact: string } {
  const donorName =
    typeof raw.donorName === "string" && raw.donorName.trim()
      ? raw.donorName.trim().slice(0, 60)
      : "Friend of Athena";
  const amount =
    typeof raw.amount === "number" && Number.isFinite(raw.amount) && raw.amount > 0
      ? Math.round(raw.amount)
      : 25;
  const impact =
    typeof raw.impact === "string" && raw.impact.trim()
      ? raw.impact.trim().slice(0, 280)
      : "emergency shelter, trauma-informed counseling, and legal advocacy for survivors";
  return { donorName, amount, impact };
}

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => ({}))) as ThanksRequestBody;
  const { donorName, amount, impact } = parseBody(raw);

  const hasApiKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (!hasApiKey) {
    return Response.json({
      source: "fallback",
      message: buildFallbackMessage(donorName, amount),
    });
  }

  try {
    const result = streamText({
      model: google(MODEL_ID),
      system:
        "You write one warm, specific, two-sentence thank-you message for a donor to a domestic-violence shelter nonprofit called Shield of Athena. Never invent statistics. Keep it under 320 characters.",
      prompt: `Write a thank-you message for ${donorName}, who donated $${amount} to fund ${impact}.`,
    });

    return result.toTextStreamResponse({
      headers: { "x-thanks-source": "generated" },
    });
  } catch (error) {
    console.error("AI SDK call failed, falling back", error);
    return Response.json({
      source: "fallback",
      message: buildFallbackMessage(donorName, amount),
    });
  }
}
