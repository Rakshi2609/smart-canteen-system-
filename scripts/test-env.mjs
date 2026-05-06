import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function mask(value) {
  if (!value) return "missing";
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

const requiredChecks = [
  ["MONGODB_URI", process.env.MONGODB_URI],
  ["GROQ_API_KEY", process.env.GROQ_API_KEY],
  ["JWT_SECRET", process.env.JWT_SECRET],
];

const optionalChecks = [
  ["GROQ_MODEL", process.env.GROQ_MODEL],
  ["OLLAMA_URL", process.env.OLLAMA_URL],
  ["OLLAMA_MODEL", process.env.OLLAMA_MODEL],
];

console.log("Environment check");
for (const [name, value] of [...requiredChecks, ...optionalChecks]) {
  console.log(`${name}: ${value ? `loaded (${mask(value)})` : "missing"}`);
}

const failures = requiredChecks.filter(([, value]) => !value).map(([name]) => name);

if (failures.length > 0) {
  console.error(`Missing env vars: ${failures.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("Required env vars are loaded.");
}