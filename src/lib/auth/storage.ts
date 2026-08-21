export const STORAGE_KEYS = {
  auth: "auth:v1",
  ui: "ui:v1",
} as const;

interface AuthData {
  access: string;
  refresh: string;
  user?: unknown;
}

interface UiPrefs {
  theme?: "paper" | "ink";
  sidebarCollapsed?: boolean;
}

export function getAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthData;
    if (parsed && typeof parsed.access === "string" && typeof parsed.refresh === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAuth(data: AuthData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(data));
  } catch {
    // ignore (private browsing / quota)
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.auth);
  } catch {
    // ignore
  }
}

export function getUiPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ui);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UiPrefs;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setUiPrefs(prefs: UiPrefs): void {
  try {
    const current = getUiPrefs();
    localStorage.setItem(STORAGE_KEYS.ui, JSON.stringify({ ...current, ...prefs }));
  } catch {
    // ignore
  }
}

const tokenListeners = new Set<() => void>();

export function onAuthChange(listener: () => void): () => void {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

export function emitAuthChange(): void {
  for (const listener of tokenListeners) listener();
}
