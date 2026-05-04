import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    // Exclude Admin users from the network list, only fetch Donor/NGO
    const users = await User.find({ role: { $in: ["Donor", "NGO"] } })
      .select("-passwordHash") // Exclude password hash
      .sort({ createdAt: -1 });

    // Map _id to id for the frontend
    const mappedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      status: user.status,
      totalImpact: user.totalImpact,
    }));

    return NextResponse.json(mappedUsers, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
