import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Donation from "@/models/Donation";
import User from "@/models/User";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    const oldDonation = await Donation.findOne({ id });
    const updatePayload = {
      ...body,
      assignedAt: body.status === "Pickup Assigned"
        ? (oldDonation?.assignedAt || new Date())
        : (body.assignedAt ?? oldDonation?.assignedAt),
      completedAt: body.status === "Completed"
        ? (oldDonation?.completedAt || new Date())
        : (body.completedAt ?? oldDonation?.completedAt),
    };
    const updatedDonation = await Donation.findOneAndUpdate({ id }, updatePayload, { new: true, runValidators: true });
    
    if (!updatedDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // If status changed to Completed, update impacts
    if (body.status === "Completed" && oldDonation?.status !== "Completed") {
      const quantity = updatedDonation.quantity;
      if (updatedDonation.donorId) {
        await User.findByIdAndUpdate(updatedDonation.donorId, { $inc: { totalImpact: quantity } });
      }
      if (updatedDonation.ngoId) {
        await User.findByIdAndUpdate(updatedDonation.ngoId, { $inc: { totalImpact: quantity } });
      }
    }

    return NextResponse.json(updatedDonation);
  } catch (error: any) {
    console.error("Update Donation Error:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
