import { useEffect, useState } from "react";
import { authApi, usersApi } from "../../lib/api/endpoints";
import { clearAuth, emitAuthChange, getAuth, onAuthChange, setAuth } from "../../lib/auth/storage";
import type { AuthResponse, User } from "../../types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const stored = getAuth();
    return {
      user: (stored?.user as User | undefined) ?? null,
      isAuthenticated: Boolean(stored?.access),
      isInitializing: Boolean(stored?.access && !stored.user),
    };
  });

  useEffect(() => {
    return onAuthChange(() => {
      const stored = getAuth();
      setState((prev) => ({
        ...prev,
        user: (stored?.user as User | undefined) ?? null,
        isAuthenticated: Boolean(stored?.access),
      }));
    });
  }, []);

  useEffect(() => {
    const stored = getAuth();
    if (!stored?.access || stored.user) return;

    let cancelled = false;
    usersApi
      .me()
      .then((user) => {
        if (cancelled) return;
        setAuth({ ...stored, user });
        emitAuthChange();
        setState({ user, isAuthenticated: true, isInitializing: false });
      })
      .catch(() => {
        if (cancelled) return;
        clearAuth();
        emitAuthChange();
        setState({ user: null, isAuthenticated: false, isInitializing: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function setSession(data: AuthResponse) {
    setAuth({ access: data.access, refresh: data.refresh, user: data.user });
    emitAuthChange();
    setState({ user: data.user, isAuthenticated: true, isInitializing: false });
  }

  async function login(email: string, password: string) {
    const data = await authApi.login({ email, password });
    setSession(data);
    return data.user;
  }

  async function register(input: Parameters<typeof authApi.register>[0]) {
    await authApi.register(input);
    const data = await authApi.login({ email: input.email, password: input.password });
    setSession(data);
    return data.user;
  }

  async function logout() {
    const stored = getAuth();
    if (stored?.refresh) {
      try {
        await authApi.logout(stored.refresh);
      } catch {
        // ignore
      }
    }
    clearAuth();
    emitAuthChange();
    setState({ user: null, isAuthenticated: false, isInitializing: false });
  }

  return { ...state, login, register, logout };
}
