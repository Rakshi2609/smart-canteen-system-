type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 8_000;

function parseJsonResponse(raw: string, provider: "ollama" | "groq"): JsonValue {
  try {
    return JSON.parse(raw) as JsonValue;
  } catch {
    throw new Error(`Failed to parse ${provider} response as JSON`);
  }
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateWithOllama(prompt: string): Promise<JsonValue> {
  const response = await fetchWithTimeout(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { response?: string };
  if (!data.response) {
    throw new Error("Ollama response did not include generated content");
  }

  return parseJsonResponse(data.response, "ollama");
}

async function generateWithGroq(prompt: string): Promise<JsonValue> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetchWithTimeout(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq response did not include generated content");
  }

  return parseJsonResponse(content, "groq");
}

export async function generateJson(prompt: string): Promise<JsonValue> {
  try {
    return await generateWithOllama(prompt);
  } catch (ollamaError) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        `Ollama is unavailable and Groq fallback is not configured: ${ollamaError instanceof Error ? ollamaError.message : "unknown Ollama error"
        }`
      );
    }

    try {
      return await generateWithGroq(prompt);
    } catch (groqError) {
      const ollamaMessage =
        ollamaError instanceof Error ? ollamaError.message : "unknown Ollama error";
      const groqMessage = groqError instanceof Error ? groqError.message : "unknown Groq error";

      throw new Error(
        `Ollama and Groq both failed. Ollama: ${ollamaMessage}. Groq: ${groqMessage}`
      );
    }
  }
}
