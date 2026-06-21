import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

// What we want to share across the app
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

// Create the context with default empty values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  // We start with isLoading true because we don't know yet
  // if the user is logged in until Supabase checks
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When the app opens, check if the user already has a saved session.
    // This is what keeps users logged in after closing and reopening the app.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Watch for any auth changes while the app is open —
    // login, logout, or token refresh will all come through here.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    // Stop watching when the component is gone
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // No need to manually clear session here —
    // onAuthStateChange above will fire and set session to null automatically
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: session ? true : false,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Call this in any screen to get the current user/session
// e.g. const { user, isAuthenticated, signOut } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
