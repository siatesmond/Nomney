import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { COLORS } from "@/constants/theme";

export function PostActions({
  liked,
  saved,
  likes,
  comments,
  saves,
  onLike,
  onComment,
  onSave,
}: {
  liked?: boolean;
  saved?: boolean;
  likes: number;
  comments: number;
  saves: number;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
}) {
  return (
    <View className="flex-row justify-end">
      <ActionButton
        icon={liked ? "heart" : "heart-outline"}
        color={liked ? COLORS.accent : COLORS.neutral}
        count={likes}
        onPress={onLike}
        label={liked ? "Unlike post" : "Like post"}
        className="mr-2"
      />
      <ActionButton
        icon="chatbubble-outline"
        color={COLORS.neutral}
        count={comments}
        onPress={onComment}
        label="View comments"
        className="mr-2"
      />
      <ActionButton
        icon={saved ? "bookmark" : "bookmark-outline"}
        color={saved ? COLORS.accent : COLORS.neutral}
        count={saves}
        onPress={onSave}
        label={saved ? "Unsave post" : "Save post"}
      />
    </View>
  );
}

function ActionButton({
  icon,
  color,
  count,
  onPress,
  label,
  className = "",
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  count: number;
  onPress?: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-1.5 py-2 px-3 ${className}`}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-xs text-gray-500 font-semibold">{count}</Text>
    </TouchableOpacity>
  );
}
