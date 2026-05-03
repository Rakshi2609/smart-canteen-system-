import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Donation from "@/models/Donation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    const updatedDonation = await Donation.findOneAndUpdate({ id }, body, { new: true });
    
    if (!updatedDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDonation);
  } catch (error: any) {
    console.error("Update Donation Error:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
