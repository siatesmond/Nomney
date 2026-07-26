import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "@/constants/theme";

export type ActionOption = {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  destructive?: boolean;
};

interface Props {
  visible: boolean;
  title?: string;
  options: ActionOption[];
  onCancel: () => void;
  cancelLabel?: string;
}

// A bottom action sheet rendered as a local absolute overlay (not a native
// <Modal>), so it works on screens presented as native modals too. Replaces the
// system Alert-style option list (e.g. "Camera / Gallery").
export function ActionSheet({
  visible,
  title,
  options,
  onCancel,
  cancelLabel = "Cancel",
}: Props) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        elevation: 1000,
        justifyContent: "flex-end",
      }}
    >
      {/* Tap-to-dismiss scrim */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />

      <View style={{ padding: 12, paddingBottom: 28 }}>
        <View
          style={{
            backgroundColor: "#FDFCF9",
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          {title && (
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderColor: COLORS.line,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.muted,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {title}
              </Text>
            </View>
          )}

          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              activeOpacity={0.7}
              onPress={() => {
                onCancel();
                opt.onPress();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 16,
                borderTopWidth: i === 0 && !title ? 0 : 1,
                borderColor: COLORS.line,
              }}
            >
              {opt.icon && (
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={opt.destructive ? "#E5484D" : COLORS.accent}
                />
              )}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: opt.destructive ? "#E5484D" : COLORS.ink,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCancel}
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
            {cancelLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
