import { useState } from "react";
import { router } from "expo-router";
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "../lib/supabase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function useGoogleAuth() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const signInWithGoogle = async () => {
    setGoogleError("");

    try {
      setGoogleLoading(true);

      await GoogleSignin.hasPlayServices();

      // Open Google's account picker
      const response = await GoogleSignin.signIn();

      // Exit if the user cancels sign in or no successful response
      if (!isSuccessResponse(response)) {
        return;
      }

      // Extract the ID token user's profile details from Google res
      const idToken = response.data.idToken;
      const googleFirstName = response.data.user.givenName || "";
      const googleLastName = response.data.user.familyName || "";

      // For supabase to verify users's identity
      if (!idToken) {
        console.error("No ID token returned from Google");
        setGoogleError("Google sign-in failed. Please try again.");
        return;
      }

      // Use the idToken to get auth session from Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        console.error("Supabase Google sign-in error:", error);
        setGoogleError(
          error.message || "Google sign-in failed. Please try again.",
        );
        return;
      }

      console.log("Google sign-in successful:", data);

      // Check whether the user has already completed their profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Failed to check profile:", profileError);
      }

      if (!profile?.username) {
        router.replace({
          pathname: "/register-complete-profile", // new users redirected to complete profile setup
          params: {
            firstName: googleFirstName,
            lastName: googleLastName,
          },
        });
      } else {
        router.replace("/home"); // existing users with acc
      }
    } catch (err: any) {
      if (err.code === statusCodes.IN_PROGRESS) {
        // Sign in already in progress
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setGoogleError("Google Play Services is not available on this device.");
      } else {
        console.error("Unexpected Google sign-in error:", err);
        setGoogleError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return { signInWithGoogle, googleLoading, googleError };
}
