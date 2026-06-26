// A category pill. "soft" is the light style, "solid" is the filled orange one.
import { Text, View } from "react-native";

type TagVariant = "soft" | "solid";

export function Tag({
  label,
  variant = "soft",
}: {
  label: string;
  variant?: TagVariant;
}) {
  const isSolid = variant === "solid";
  return (
    <View
      className={`px-3 py-1.5 rounded-full ${isSolid ? "bg-accent" : "bg-accent-soft"}`}
    >
      <Text
        className={`text-xs font-semibold ${isSolid ? "text-white" : "text-accent"}`}
      >
        {label}
      </Text>
    </View>
  );
}
