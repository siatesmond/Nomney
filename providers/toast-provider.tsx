import { Ionicons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";

type ToastType = "success" | "error";

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const insets = useSafeAreaInsets();

  const showToast = useCallback(
    (msg: string, t: ToastType = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setType(t);
      setVisible(true);
      opacity.setValue(0);
      translateY.setValue(-16);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -16, duration: 280, useNativeDriver: true }),
        ]).start(() => setVisible(false));
      }, 3200);
    },
    [opacity, translateY],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: insets.top + 12,
            left: 16,
            right: 16,
            zIndex: 9999,
            opacity,
            transform: [{ translateY }],
          }}
        >
          <View
            style={{
              backgroundColor: type === "success" ? "#1C1917" : "#DC2626",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <Ionicons
              name={type === "success" ? "checkmark-circle" : "alert-circle"}
              size={20}
              color={type === "success" ? COLORS.accent : "#fff"}
            />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500", flex: 1 }}>
              {message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
