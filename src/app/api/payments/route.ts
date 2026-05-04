import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await connectToDatabase();
    const payments = await Payment.find().sort({ createdAt: -1 });
    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("Fetch Payments Error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const payment = await Payment.create(body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("Create Payment Error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
