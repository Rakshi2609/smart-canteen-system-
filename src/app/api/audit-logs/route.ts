import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await connectToDatabase();
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Fetch Audit Logs Error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const log = await AuditLog.create(body);
    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error("Create Audit Log Error:", error);
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}
