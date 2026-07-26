// Settings: edit profile, change password, feedback, log out, delete.
import { useConfirm } from "@/components/ui/useConfirm";
import { COLORS } from "@/constants/theme";
import { signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/providers/toast-provider";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEEDBACK_EMAIL = "support@nomney.app"; // TODO: change to your real address
const DANGER = "#E5484D";

export default function SettingsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { alert, confirm, confirmHost } = useConfirm();

  const sendFeedback = () => {
    Linking.openURL(
      `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Nomney feedback")}`,
    ).catch(() =>
      showToast(`Couldn't open email. Reach us at ${FEEDBACK_EMAIL}`, "error"),
    );
  };

  const confirmLogout = () => {
    confirm({
      title: "Log out?",
      message: "You'll need to sign in again.",
      confirmLabel: "Log out",
      cancelLabel: "Cancel",
      onConfirm: () => signOut(),
    });
  };

  const confirmDelete = () => {
    confirm({
      title: "Delete account?",
      message:
        "This permanently deletes your account and all your posts. This can't be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          const { error } = await supabase.rpc("delete_account");
          if (error) throw error;
          await signOut();
        } catch (err: any) {
          alert("Delete failed", err.message || "Please try again later.");
        }
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FDFCF9]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="ml-2 text-lg font-bold" style={{ color: COLORS.ink }}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Account */}
        <Section title="Account">
          <Row
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push("/edit-profile")}
          />
          <Row
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => router.push("/change-password")}
            last
          />
        </Section>

        {/* Support */}
        <Section title="Support">
          <Row
            icon="chatbubble-ellipses-outline"
            label="Send Feedback"
            onPress={sendFeedback}
            last
          />
        </Section>

        {/* Actions */}
        <Section title=" ">
          <Row icon="log-out-outline" label="Log Out" onPress={confirmLogout} />
          <Row
            icon="trash-outline"
            label="Delete Account"
            color={DANGER}
            onPress={confirmDelete}
            last
          />
        </Section>
      </ScrollView>

      {confirmHost}
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-5">
      <Text
        className="text-xs font-semibold uppercase px-4 mb-1.5"
        style={{ color: COLORS.muted }}
      >
        {title}
      </Text>
      <View className="bg-white">{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  color,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  color?: string;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5"
      style={last ? undefined : { borderBottomWidth: 1, borderColor: "#F0F0F0" }}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={color ?? COLORS.ink} />
      <Text className="flex-1 ml-3 text-sm" style={{ color: color ?? COLORS.ink }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
    </TouchableOpacity>
  );
}
