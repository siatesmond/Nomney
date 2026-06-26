import { createContext, useContext } from "react";

import { Profile } from "@/constants/types";

export type { Profile };

export type AuthData = {
  claims?: Record<string, any> | null;
  profile?: Profile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthData>({
  claims: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  refreshProfile: async () => { },
});

export const useAuthContext = () => useContext(AuthContext);