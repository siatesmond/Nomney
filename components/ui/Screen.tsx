// Basic page wrapper with the app background and default padding.
import { ReactNode } from "react";
import { View } from "react-native";

type ScreenProps = {
  children: ReactNode;
  noPadding?: boolean;
};

export function Screen({ children, noPadding = false }: ScreenProps) {
  return (
    <View
      className={`flex-1 bg-[#FDFCF9] justify-center pt-10 ${
        noPadding ? "" : "px-2"
      }`}
    >
      {children}
    </View>
  );
}