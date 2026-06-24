import { AuthContext, Profile } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [claims, setClaims] = useState<Record<string, any> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClaims = async () => {
      const { data, error } = await supabase.auth.getClaims();

      if (error) {
        console.error("Error fetching claims:", error);
      }

      setClaims(data?.claims ?? null);
    };

    fetchClaims();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      console.log("Auth state changed:", { event: _event });

      if (_event === "SIGNED_OUT") {
        setClaims(null);
        return;
      }

      const { data } = await supabase.auth.getClaims();
      setClaims(data?.claims ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);

      if (claims) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", claims.sub)
          .single();

        if (!cancelled) setProfile(data as Profile | null);
      } else {
        if (!cancelled) setProfile(null);
      }

      if (!cancelled) setIsLoading(false);
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [claims]);

  // Re-fetch the current user's profile on demand (e.g. after editing it).
  // Does not toggle isLoading, so it won't flash the splash/loading gate.
  const refreshProfile = useCallback(async () => {
    if (!claims?.sub) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", claims.sub)
      .single();

    if (error) {
      console.error("Failed to refresh profile:", error.message);
      return;
    }
    setProfile(data as Profile | null);
  }, [claims?.sub]);

  return (
    <AuthContext.Provider
      value={{
        claims,
        isLoading,
        profile,
        isLoggedIn: !!claims,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}