// Text input with an icon on the left (and an optional one on the right).
import { View, TextInput, TextInputProps } from "react-native";
import React from "react";

type Props = TextInputProps & {
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function InputWithIcon({ icon, rightIcon, ...props }: Props) {
  return (
    <View className="flex-row items-center bg-[#F6F5F3] p-3 rounded-xl w-full mb-4">
      {icon}

      <TextInput
        {...props}
        className="flex-1 ml-3"
        placeholderTextColor="#838383"
      />

      {rightIcon && <View className="ml-2">{rightIcon}</View>}
    </View>
  );
}