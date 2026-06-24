import { supabase } from "@/lib/supabase";
import { Text, TouchableOpacity } from "react-native";

export default function SignOutButton() {
  const onSignOutButtonPress = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
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