import { View, TextInput, TextInputProps } from "react-native";

type Props = TextInputProps & {
  icon: React.ReactNode;
};

export function InputWithIcon({ icon, ...props }: Props) {
  return (
    <View className="flex-row items-center bg-[#F6F5F3] p-3 rounded-xl w-full mb-4">
      {icon}

      <TextInput
        {...props}
        className="flex-1 ml-3"
        placeholderTextColor="#838383"
      />
    </View>
  );
}