import { NextResponse } from "next/server";
import { generateJson } from "@/lib/ai";

type InventoryItem = {
  name: string;
  stock: number;
  status: string;
};

type InsightsResponse = {
  demandPrediction: number;
  suggestedDish: string;
  restockAlert: string;
  wasteReduction: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      inventory: InventoryItem[];
      activeOrders: number;
      timeOfDay: string;
    };
    const { inventory, activeOrders, timeOfDay } = body;

    // Construct the prompt for LLaMA 3
    const prompt = `
You are a smart canteen AI manager. Based on the current stock and active orders, provide short, actionable insights.

CURRENT STATE:
Time of Day: ${timeOfDay}
Inventory:
${inventory.map((item) => `- ${item.name}: ${item.stock} portions (${item.status})`).join("\n")}

Active Orders waiting: ${activeOrders}

Please output a JSON object with the following structure:
{
  "demandPrediction": <number between 0-100 indicating expected rush>,
  "suggestedDish": "<name of dish to start preparing next>",
  "restockAlert": "<short warning about what might run out>",
  "wasteReduction": "<short advice to avoid waste today>"
}

Output ONLY valid JSON.
`;

    const insights = await generateJson(prompt);

    return NextResponse.json({ insights: insights as InsightsResponse });
  } catch (error: unknown) {
    console.error("AI Insights Error:", error);
    const message = error instanceof Error ? error.message : undefined;

    return NextResponse.json(
      {
        error:
          message ||
          "Failed to generate AI insights. Start Ollama locally or configure GROQ_API_KEY for fallback.",
      },
      { status: 500 }
    );
  }
}
