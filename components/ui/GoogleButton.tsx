import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";

type GoogleButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
};

export function GoogleButton({
  title,
  loading,
  style,
  ...props
}: GoogleButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      disabled={loading || props.disabled}
      style={[
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
      className="bg-white border border-gray-300 p-4 rounded-3xl w-full mt-6"
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <View className="flex-row items-center justify-center">
          <Image
            source={require("../../assets/images/google-logo.png")}
            className="w-5 h-5 mr-3"
            resizeMode="contain"
          />
          <Text className="text-black font-bold">{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}