import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useAuth: Initializing...");

    // 1. Load current session
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("useAuth: Initial session", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    loadSession();

    // 2. Subscribe to changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setTimeout(() => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }, 500);
      }
    );

    // 3. Cleanup
    return () => {
      console.log("useAuth: Cleaning up subscription");
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign out helper
  const signOut = async () => {
    console.log("useAuth: Signing out");
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return { user, session, loading, signOut };
};
