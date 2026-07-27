import { ReactNode, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

type ScreenProps = {
  children: ReactNode;
  noPadding?: boolean;
  scrollable?: boolean;
};

export function Screen({
  children,
  noPadding = false,
  scrollable = true,
}: ScreenProps) {
  const paddingClass = noPadding ? "" : "px-2";
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!scrollable) {
    return (
      <View className={`flex-1 bg-[#FDFCF9] justify-center pt-10 ${paddingClass}`}>
        {children}
      </View>
    );
  }

  const scrollContent = (
    <ScrollView
      className={paddingClass}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FDFCF9" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled={Platform.OS === "ios" || keyboardVisible}
    >
      {scrollContent}
    </KeyboardAvoidingView>
  );
}