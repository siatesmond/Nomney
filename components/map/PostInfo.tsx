import { COLORS } from "@/constants/theme";
import { PostLocation } from "@/lib/posts";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

// The text + buttons part of a selected-post card (shared by the single card
// and the multi-post carousel). The photo above it is passed in separately.
export function PostInfo({
  post,
  showUser,
  onView,
  onMaps,
}: {
  post: PostLocation;
  showUser: boolean;
  onView: () => void;
  onMaps: () => void;
}) {
  return (
    <>
      <Text
        style={{ color: COLORS.ink }}
        className="text-base font-bold"
        numberOfLines={1}
      >
        {post.title}
      </Text>
      {showUser && !!post.username && (
        <Text style={{ color: COLORS.muted }} className="text-xs mt-0.5">
          by @{post.username}
        </Text>
      )}
      {!!post.locationName && (
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-sharp" size={13} color={COLORS.accent} />
          <Text
            style={{ color: COLORS.muted }}
            className="text-xs ml-1 flex-1"
            numberOfLines={1}
          >
            {post.locationName}
          </Text>
        </View>
      )}
      <View className="flex-row gap-3 mt-3">
        <TouchableOpacity
          className="flex-1 rounded-xl py-3 items-center"
          style={{ backgroundColor: COLORS.accent }}
          activeOpacity={0.85}
          onPress={onView}
        >
          <Text className="text-white font-semibold text-sm">View post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-xl py-3 items-center"
          style={{ borderWidth: 1, borderColor: COLORS.line }}
          activeOpacity={0.85}
          onPress={onMaps}
        >
          <Text style={{ color: COLORS.ink }} className="font-semibold text-sm">
            Google Maps
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
