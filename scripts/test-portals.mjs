import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@smartcanteen.local";
const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

async function checkRoute(path, expectedFragments = []) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const text = await response.text();

  for (const fragment of expectedFragments) {
    if (!text.includes(fragment)) {
      throw new Error(`Route ${path} missing expected text: ${fragment}`);
    }
  }

  return { status: response.status };
}

async function loginAdmin() {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Admin login failed: ${response.status}`);
  }

  const data = await response.json();
  const cookieHeader = response.headers.get("set-cookie") || "";
  const cookie = cookieHeader.split(";")[0];

  if (data.user?.role !== "Admin") {
    throw new Error(`Expected Admin role, got ${data.user?.role || "unknown"}`);
  }

  if (!cookie.includes("auth_token=")) {
    throw new Error("Login response did not set auth_token cookie");
  }

  return { token: data.token, cookie };
}

async function checkPortalRedirect(cookie) {
  const response = await fetch(`${baseUrl}/portals`, {
    redirect: "manual",
    headers: { Cookie: cookie },
  });

  const location = response.headers.get("location") || "";
  if (response.status < 300 || response.status > 399) {
    throw new Error(`Expected redirect from /portals, got ${response.status}`);
  }

  if (!location.includes("/admin")) {
    throw new Error(`Expected /portals to redirect to /admin, got ${location || "no location"}`);
  }
}

async function main() {
  const routes = [
    ["/", ["SmartCanteen", "Explore"]],
    ["/login", ["Welcome Back", "Sign In"]],
    ["/register", ["Create Account", "Join"]],
    ["/support", ["Support the Ecosystem"]],
    ["/map", ["Food Near Me"]],
  ];

  for (const [path, fragments] of routes) {
    const result = await checkRoute(path, fragments);
    console.log(`Route OK: ${path} (${result.status})`);
  }

  const portalsResult = await checkRoute("/portals");
  console.log(`Route OK: /portals (${portalsResult.status})`);

  const { cookie } = await loginAdmin();
  console.log("Admin login OK");
  await checkPortalRedirect(cookie);
  console.log("Portal redirect OK");
}

main().catch((error) => {
  console.error("Portal test failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});