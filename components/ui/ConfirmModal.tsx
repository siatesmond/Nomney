import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "@/constants/theme";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// Rendered as an absolute overlay (not a React Native <Modal>): the screens that
// use this — e.g. the New Post screen — are themselves presented as native
// modals, and a nested <Modal> silently fails to appear on top of one. An
// absolute-positioned View avoids that entirely, matching the loading overlay.
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
  onCancel,
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
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
      }}
    >
      <View
        style={{
          backgroundColor: "#FDFCF9",
          borderRadius: 20,
          padding: 24,
          width: "100%",
          maxWidth: 340,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: "700",
            color: "#1C1917",
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            lineHeight: 21,
            marginBottom: 24,
          }}
        >
          {message}
        </Text>

        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={onConfirm}
            style={{
              backgroundColor: COLORS.accent,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>

          {cancelLabel && onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={{
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                backgroundColor: "#F3F4F6",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: "#374151", fontWeight: "500", fontSize: 15 }}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
