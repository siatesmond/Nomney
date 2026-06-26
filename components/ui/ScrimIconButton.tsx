// Round icon button on a dark see-through circle. Used for close/back buttons over photos.
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { TouchableOpacity } from "react-native";

import { SCRIM } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function ScrimIconButton({
  icon,
  onPress,
  size = 17,
  className = "w-8 h-8",
}: {
  icon: IconName;
  onPress: () => void;
  size?: number;
  /** Tailwind sizing for the circle (default 32×32). */
  className?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${className} rounded-full items-center justify-center`}
      style={{ backgroundColor: SCRIM }}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={size} color="#fff" />
    </TouchableOpacity>
  );
}
