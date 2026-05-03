import { NextResponse } from "next/server";
import { generateJson } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
    }

    const prompt = `
      You are a local food and restaurant guide system.
      I am currently located at exact coordinates: Latitude ${lat}, Longitude ${lng}.
      Generate a list of 10 real (or highly realistic) food places, restaurants, cafes, or canteens within a 5 kilometer radius of my location.
      
      Respond STRICTLY with a JSON object in this exact format:
      {
        "places": [
          {
            "name": "Restaurant Name",
            "lat": 12.3456,
            "lng": 78.9012,
            "cuisine": "Indian"
          }
        ]
      }
      
      IMPORTANT:
      - The lat and lng values must be numerically within a roughly ~0.045 degree difference from my location to stay within 5km.
      - Do not include any other text, only the JSON object.
    `;

    const result = await generateJson(prompt) as any;
    
    if (!result || !result.places || !Array.isArray(result.places)) {
      throw new Error("Invalid format returned by AI");
    }

    return NextResponse.json({ places: result.places }, { status: 200 });

  } catch (error: any) {
    console.error("AI Nearby Places Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate nearby places" }, { status: 500 });
  }
}
