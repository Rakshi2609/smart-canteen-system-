import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { canteenName } = body;

    // Construct the prompt for LLaMA 3
    const prompt = `
You are a creative chef for an Indian/Global fusion restaurant.
Generate a quick, random menu for a canteen named "${canteenName}".
Return exactly 4 food or beverage items.
Vary the items (e.g., snacks, main course, beverages).

Please output a JSON object with the following structure:
{
  "menu": [
    {
      "id": 1,
      "name": "Item Name",
      "price": "₹XX",
      "available": <random number between 0 and 50>,
      "category": "Category Name"
    }
  ]
}

Output ONLY valid JSON.
`;

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
    let result;
    try {
      result = JSON.parse(data.response);
    } catch (parseErr) {
      throw new Error("Failed to parse AI response as JSON");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Menu Error:", error);
    // Provide a random mock fallback if Ollama fails
    const mockMenu = [
      { id: 1, name: "AI Masala Dosa", price: "₹60", available: 10, category: "AI Specials" },
      { id: 2, name: "Neural Network Noodles", price: "₹120", available: 25, category: "Main Course" },
      { id: 3, name: "Ollama Filter Coffee", price: "₹30", available: 5, category: "Beverages" },
      { id: 4, name: "Server Crash Samosa", price: "₹25", available: 0, category: "Snacks" }
    ];
    return NextResponse.json({ menu: mockMenu }, { status: 200 });
  }
}
