import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";

// Signs the user out of Supabase (and Google, if they used it). The root
// navigator watches the auth state and redirects to login automatically.
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  try {
    if (await GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
  } catch {
    // ignore Google sign-out errors
  }
  if (error) console.error("Error signing out:", error.message);
}
