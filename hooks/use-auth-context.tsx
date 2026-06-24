import { createContext, useContext } from "react";

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

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