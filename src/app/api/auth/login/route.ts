import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role, status: user.status }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status },
        token,
      },
      { status: 200 }
    );
    
    // Set auth_token cookie - NOT httpOnly so browser will definitely send it
    // (This is a workaround for the environment, normally httpOnly is better for security)
    response.cookies.set("auth_token", token, {
      httpOnly: false, // Allow JavaScript access for debugging/fallback
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });
    
    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
