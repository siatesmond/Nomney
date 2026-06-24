import { createContext, useContext } from "react";

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export type AuthData = {
  claims?: Record<string, any> | null;
  profile?: Profile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthData>({
  claims: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
});

export const useAuthContext = () => useContext(AuthContext);