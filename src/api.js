const configuredBase = import.meta.env.VITE_API_BASE_URL;

const localAdminBypass =
  import.meta.env.DEV &&
  import.meta.env.VITE_ADMIN_DEV_BYPASS === "true";

const rawBase = String(
  configuredBase ||
    (import.meta.env.DEV ? "http://localhost:5001/api" : "")
)
  .trim()
  .replace(/\/+$/, "");

const API_BASE_URL = rawBase
  ? /\/api$/i.test(rawBase)
    ? rawBase
    : `${rawBase}/api`
  : "";

let cachedAdminToken = null;
let tokenExpiresAt = 0;
let tokenRequest = null;

function getApiUrl(endpoint) {
  if (!API_BASE_URL) {
    throw new Error(
      "Admin API is not configured. Set VITE_API_BASE_URL in Vercel and redeploy."
    );
  }

  const rawPath = String(endpoint || "");

  const path = rawPath.startsWith("/api/")
    ? rawPath.slice(4)
    : rawPath.startsWith("/")
      ? rawPath
      : `/${rawPath}`;

  return `${API_BASE_URL}${path}`;
}

async function getAdminToken() {
  // Development only: the local backend handles the bypass.
  if (localAdminBypass) {
    return null;
  }

  // Renew the token before it expires.
  if (
    cachedAdminToken &&
    Date.now() < tokenExpiresAt - 30_000
  ) {
    return cachedAdminToken;
  }

  // Avoid multiple simultaneous token requests.
  if (tokenRequest) {
    return tokenRequest;
  }

  tokenRequest = (async () => {
    const response = await fetch("/api/admin-token", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const contentType = response.headers.get("content-type") || "";

    const result = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok || !result?.token) {
      throw new Error(
        result?.message ||
          "Cannot obtain admin access. Check Vercel Deployment Protection and server environment variables."
      );
    }

    cachedAdminToken = result.token;

    const expiresIn = Number(result.expiresIn) || 300;
    tokenExpiresAt = Date.now() + expiresIn * 1000;

    return cachedAdminToken;
  })();

  try {
    return await tokenRequest;
  } finally {
    tokenRequest = null;
  }
}

export async function api(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const isForm =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = new Headers(options.headers || {});

  if (
    !isForm &&
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = await getAdminToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    getApiUrl(normalizedEndpoint),
    {
      ...options,
      headers,
    }
  );

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data !== null
        ? data.message || `Request failed: ${response.status}`
        : data || `Request failed: ${response.status}`
    );
  }

  return data;
}

export const unwrap = (response) => response?.data ?? response;