import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inventory, activeOrders, timeOfDay } = body;

    // Construct the prompt for LLaMA 3
    const prompt = `
You are a smart canteen AI manager. Based on the current stock and active orders, provide short, actionable insights.

CURRENT STATE:
Time of Day: ${timeOfDay}
Inventory:
${inventory.map((i: any) => `- ${i.name}: ${i.stock} portions (${i.status})`).join("\n")}

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

    // Make request to local Ollama instance
    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: false,
        format: "json", // Forces JSON output in Ollama
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Failed to connect to local Ollama instance: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    let insights;
    try {
      insights = JSON.parse(data.response);
    } catch (parseErr) {
      throw new Error("Failed to parse AI response as JSON");
    }

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI insights. Ensure Ollama is running locally with llama3 model." },
      { status: 500 }
    );
  }
}
