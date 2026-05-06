import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from "./config";
import { SupabaseSession, SupabaseUser } from "./types";

const SESSION_STORAGE_KEY = "supabase-auth-session";

function authHeaders(accessToken?: string) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: accessToken ? `Bearer ${accessToken}` : `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

async function authRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, init);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.msg || data?.error_description || data?.message || "Supabase request failed");
  }

  return data as T;
}

export function loadStoredSession(): SupabaseSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
}

export function storeSession(session: SupabaseSession | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function signInWithPassword(email: string, password: string) {
  return authRequest<SupabaseSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export async function signUpWithPassword(email: string, password: string) {
  return authRequest<SupabaseSession>("/auth/v1/signup", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshSession(refreshToken: string) {
  return authRequest<SupabaseSession>("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function fetchCurrentUser(accessToken: string) {
  return authRequest<SupabaseUser>("/auth/v1/user", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export async function signOut(accessToken: string) {
  await authRequest("/auth/v1/logout", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}
