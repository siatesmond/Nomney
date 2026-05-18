import { View } from "react-native";
import { ReactNode } from "react";

type ScreenProps = {
  children: ReactNode;
};

// base screen 
export function Screen({ children }: ScreenProps) {
  return (
    <View className="flex-1 bg-[#F6F5F3] justify-center pt-11">
      {children}
    </View>
  );
}