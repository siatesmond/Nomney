// Change password for the signed-in user via Supabase auth.
import { useConfirm } from "@/components/ui/useConfirm";
import { COLORS } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/providers/toast-provider";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Same policy as register / reset-password: min 8 chars with an uppercase,
// lowercase, digit and a symbol (matches Supabase's allowed symbols).
const isValidPassword = (password: string) =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,.\/`~]/.test(password);

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { alert, confirmHost } = useConfirm();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!isValidPassword(password)) {
      return alert(
        "Weak password",
        "Password must have at least 8 characters with uppercase, lowercase, digits and a symbol.",
      );
    }
    if (password !== confirm) {
      return alert("Passwords don't match", "Please re-enter the same password in both fields.");
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.back();
      showToast("Password changed", "success");
    } catch (err: any) {
      alert("Couldn't change password", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FDFCF9]">
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
        <Text
          className="text-xs font-semibold uppercase mb-1"
          style={{ color: COLORS.muted }}
        >
          New password
        </Text>
        <View className="flex-row items-center" style={{ borderBottomWidth: 1, borderColor: "#E5E5E5" }}>
          <TextInput
            className="flex-1 py-2 text-base"
            style={{ color: COLORS.ink }}
            placeholder="At least 8 characters"
            placeholderTextColor={COLORS.muted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        </View>

        <Text
          className="text-xs font-semibold uppercase mb-1 mt-5"
          style={{ color: COLORS.muted }}
        >
          Confirm password
        </Text>
        <TextInput
          className="py-2 text-base"
          style={{ borderBottomWidth: 1, borderColor: "#E5E5E5", color: COLORS.ink }}
          placeholder="Re-enter password"
          placeholderTextColor={COLORS.muted}
          secureTextEntry={!showPassword}
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

      {confirmHost}
    </SafeAreaView>
  );
}
