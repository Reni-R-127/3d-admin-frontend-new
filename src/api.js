const configuredBase = import.meta.env.VITE_API_BASE_URL;
const rawBase = String(configuredBase || (import.meta.env.DEV ? "http://localhost:5001/api" : "")).trim().replace(/\/+$/, "");
const API_BASE_URL = rawBase ? (/\/api$/i.test(rawBase) ? rawBase : `${rawBase}/api`) : "";

function getApiUrl(endpoint) {
  if (!API_BASE_URL) throw new Error("Admin API is not configured. Set VITE_API_BASE_URL in the Vercel project and redeploy.");
  const rawPath = String(endpoint || "");
  const path = rawPath.startsWith("/api/") ? rawPath.slice(4) : (rawPath.startsWith("/") ? rawPath : `/${rawPath}`);
  return `${API_BASE_URL}${path}`;
}

export async function api(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const token = localStorage.getItem("projenius_admin_token");

  const isForm =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const response = await fetch(
    getApiUrl(normalizedEndpoint),
    {
      ...options,
      headers: {
        ...(!isForm && options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
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

  if (
    normalizedEndpoint.includes("/auth/login") &&
    data?.token
  ) {
    localStorage.setItem("projenius_admin_token", data.token);
  }

  return data;
}

export const unwrap = (response) => response?.data ?? response;