import { NextResponse } from "next/server";
import { generateJson } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { canteenName: string };
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

    const result = await generateJson(prompt);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("AI Menu Error:", error);
    // Provide a random mock fallback if both Ollama and optional Groq fail.
    const mockMenu = [
      { id: 1, name: "AI Masala Dosa", price: "₹60", available: 10, category: "AI Specials" },
      { id: 2, name: "Neural Network Noodles", price: "₹120", available: 25, category: "Main Course" },
      { id: 3, name: "Fallback Filter Coffee", price: "₹30", available: 5, category: "Beverages" },
      { id: 4, name: "Server Crash Samosa", price: "₹25", available: 0, category: "Snacks" }
    ];
    return NextResponse.json({ menu: mockMenu }, { status: 200 });
  }
}
