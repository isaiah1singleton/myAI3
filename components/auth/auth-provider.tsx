"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchCurrentUser,
  loadStoredSession,
  refreshSession,
  signInWithPassword,
  signOut as signOutRequest,
  signUpWithPassword,
  storeSession,
} from "@/lib/supabase/auth-client";
import { SupabaseSession, SupabaseUser } from "@/lib/supabase/types";

type AuthContextValue = {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateSession = useCallback(async () => {
    const stored = loadStoredSession();
    if (!stored?.access_token) {
      setLoading(false);
      return;
    }

    try {
      let nextSession = stored;
      const expiresAt = stored.expires_at ? stored.expires_at * 1000 : 0;

      if (expiresAt && expiresAt <= Date.now() && stored.refresh_token) {
        nextSession = await refreshSession(stored.refresh_token);
        storeSession(nextSession);
      }

      const nextUser = await fetchCurrentUser(nextSession.access_token);
      setSession(nextSession);
      setUser(nextUser);
    } catch {
      storeSession(null);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await signInWithPassword(email, password);
    const nextUser = await fetchCurrentUser(nextSession.access_token);
    storeSession(nextSession);
    setSession(nextSession);
    setUser(nextUser);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const nextSession = await signUpWithPassword(email, password);
    if (!nextSession.access_token) {
      throw new Error(
        "Sign-up succeeded, but email confirmation may be required before login."
      );
    }
    const nextUser = await fetchCurrentUser(nextSession.access_token);
    storeSession(nextSession);
    setSession(nextSession);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    if (session?.access_token) {
      try {
        await signOutRequest(session.access_token);
      } catch {
        // best effort
      }
    }
    storeSession(null);
    setSession(null);
    setUser(null);
  }, [session]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
