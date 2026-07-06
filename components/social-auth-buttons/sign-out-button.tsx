import { supabase } from "@/lib/supabase";
import { Text, TouchableOpacity } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function SignOutButton() {
  const onSignOutButtonPress = async () => {
    try {
      // Always sign out of Supabase
      const { error } = await supabase.auth.signOut();
      
      // Only sign out of Google if a Google session exists
      const hasGoogleSession = await GoogleSignin.hasPreviousSignIn();

      if (hasGoogleSession) {
        await GoogleSignin.signOut();
      }

      if (error) {
        console.error("Error signing out:", error);
      }
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <TouchableOpacity
      className="px-9 py-2.5 rounded-3xl border border-[#DDD]"
      onPress={onSignOutButtonPress}
      activeOpacity={0.7}
    >
      <Text className="text-[#999] text-sm font-medium">Log Out</Text>
    </TouchableOpacity>
  );
}
