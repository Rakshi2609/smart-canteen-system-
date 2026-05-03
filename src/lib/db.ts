import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-canteen";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const isLocal = MONGODB_URI.includes("localhost") || MONGODB_URI.includes("127.0.0.1");
    console.log(`📡 Connecting to ${isLocal ? "LOCAL" : "CLOUD"} Database...`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ Connected to ${isLocal ? "Local" : "Cloud"} MongoDB`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
