import nextEnv from "@next/env";
import mongoose from "mongoose";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

async function testMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri, { bufferCommands: false });
  const result = await mongoose.connection.db.admin().ping();
  await mongoose.disconnect();
  return result;
}

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Groq models check failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data.data) ? data.data.length : 0;
}

async function main() {
  try {
    const ping = await testMongo();
    console.log("MongoDB ping:", ping.ok ? "ok" : "unexpected response");
  } catch (error) {
    console.error("MongoDB test failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }

  try {
    const modelCount = await testGroq();
    console.log(`Groq test: ok (${modelCount} models returned)`);
  } catch (error) {
    console.error("Groq test failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main();