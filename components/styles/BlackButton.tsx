import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

type ButtonProps = TouchableOpacityProps & { // all button props
  title: string; // custom title
};

export function Button({ title, style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      style={[
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4, // Android shadow
        },
        style,
      ]}
      className="bg-black p-4 rounded-3xl w-full mt-6"
    >
      <Text className="text-white font-bold text-center">
        {title}
      </Text>
    </TouchableOpacity>
  );
}