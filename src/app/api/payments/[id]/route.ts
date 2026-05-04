import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolved = await params;
    const id = resolved.id;
    const payment = await Payment.findOne({ paymentId: id });
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("Fetch Payment Error:", error);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolved = await params;
    const id = resolved.id;
    const body = await req.json();
    const updated = await Payment.findOneAndUpdate({ paymentId: id }, body, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Payment Error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
