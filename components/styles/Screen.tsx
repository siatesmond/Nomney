import { View } from "react-native";
import { ReactNode } from "react";

type ScreenProps = {
  children: ReactNode;
};

// base screen 
export function Screen({ children }: ScreenProps) {
  return (
    <View className="flex-1 bg-[#FDFCF9] justify-center px-6">
      {children}
    </View>
  );
}