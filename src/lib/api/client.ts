import { normalizeError } from "./errors";
import { clearAuth, emitAuthChange, getAuth, setAuth } from "../auth/storage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  auth?: boolean;
  retryOn401?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const auth = getAuth();
  if (!auth?.refresh) {
    clearAuth();
    emitAuthChange();
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: auth.refresh }),
    });

    if (!res.ok) {
      clearAuth();
      emitAuthChange();
      return null;
    }

    const data = (await res.json()) as { access: string; refresh?: string };
    setAuth({
      access: data.access,
      refresh: data.refresh ?? auth.refresh,
      user: auth.user,
    });
    emitAuthChange();
    return data.access;
  } catch {
    return null;
  }
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    headers = {},
    auth = true,
    retryOn401 = true,
  } = options;

  const url = buildUrl(path, query);
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  const init: RequestInit = { method, headers: requestHeaders };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  if (auth) {
    const token = getAuth()?.access;
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    throw normalizeError(0, { detail: err instanceof Error ? err.message : "Network error." });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (response.ok) {
    return payload as T;
  }

  if (response.status === 401 && auth && retryOn401 && !path.includes("/auth/")) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newAccess = await refreshPromise;
    if (newAccess) {
      return apiRequest<T>(path, { ...options, retryOn401: false });
    }
    throw normalizeError(401, { detail: "Sesión expirada. Inicia sesión de nuevo." });
  }

  throw normalizeError(response.status, payload);
}

export { BASE_URL };
