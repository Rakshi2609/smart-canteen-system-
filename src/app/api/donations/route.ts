import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Donation from "@/models/Donation";

export async function GET() {
  try {
    await connectToDatabase();
    const donations = await Donation.find().sort({ createdAt: -1 });
    return NextResponse.json(donations);
  } catch (error: any) {
    console.error("Fetch Donations Error:", error);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newDonation = await Donation.create(body);
    return NextResponse.json(newDonation, { status: 201 });
  } catch (error: any) {
    console.error("Create Donation Error:", error);
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 });
  }
}
