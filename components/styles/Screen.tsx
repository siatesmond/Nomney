import { ReactNode } from "react";
import { View } from "react-native";

type ScreenProps = {
  children: ReactNode;
};

// base screen
export function Screen({ children }: ScreenProps) {
  return (
    <View className="flex-1 bg-[#FDFCF9] justify-center px-2 pt-10">
      {children}
    </View>
  );
}
