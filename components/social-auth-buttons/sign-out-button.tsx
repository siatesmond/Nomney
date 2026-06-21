import { supabase } from "@/lib/supabase";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function SignOutButton() {
  const onSignOutButtonPress = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={onSignOutButtonPress}
      activeOpacity={0.7}
    >
      <Text style={styles.logoutText}>Log Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  logoutText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
});
