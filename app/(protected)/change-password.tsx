// Change password for the signed-in user via Supabase auth.
import { COLORS } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (password.length < 6) {
      return Alert.alert("Too short", "Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      return Alert.alert("Mismatch", "The passwords don't match.");
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert("Done", "Your password has been changed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Couldn't change password", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="ml-2 text-lg font-bold" style={{ color: COLORS.ink }}>
          Change Password
        </Text>
      </View>

      <View className="px-5 pt-4">
        <Text className="text-xs font-semibold uppercase mb-1" style={{ color: COLORS.muted }}>
          New password
        </Text>
        <TextInput
          className="border-b border-neutral-200 py-2 text-base text-neutral-900"
          placeholder="At least 6 characters"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        <Text className="text-xs font-semibold uppercase mb-1 mt-5" style={{ color: COLORS.muted }}>
          Confirm password
        </Text>
        <TextInput
          className="border-b border-neutral-200 py-2 text-base text-neutral-900"
          placeholder="Re-enter password"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="none"
        />

        <TouchableOpacity
          className="mt-8 rounded-xl py-4 items-center"
          style={{ backgroundColor: COLORS.accent, opacity: saving ? 0.7 : 1 }}
          activeOpacity={0.85}
          disabled={saving}
          onPress={save}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Save new password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
