"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();
    if (error) {
      console.error("[AuthProvider] failed to load profile:", error.message, {
        userId: currentUser.id,
      });
    }
    setProfile((data as Profile) ?? null);
  }, []);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    // getSession() reads the token from local storage (instant, no network
    // round-trip), unlike getUser() which validates against Supabase's servers
    // on every page. For client-side UI state this is the recommended call;
    // anything security-sensitive is enforced server-side / by RLS anyway.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    await loadProfile(currentUser);
  }, [loadProfile]);

  useEffect(() => {
    const supabase = createClient();

    // Sync auth state from Supabase (external system) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [refresh, loadProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
