// 3-column grid of post thumbnails. Tap one to open it.
// Uses expo-image so thumbnails are cached instead of re-downloaded on scroll,
// and shows its own loading / empty state.
import { COLORS } from "@/constants/theme";
import { ImageGridItem } from "@/constants/types";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

type ImageGridProps = {
  items: ImageGridItem[];
  onPressItem?: (id: string) => void;
  // Shown when there are no items and we're not loading.
  emptyText?: string;
  loading?: boolean;
};

export function ImageGrid({
  items,
  onPressItem,
  emptyText = "No posts yet",
  loading = false,
}: ImageGridProps) {
  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="items-center py-16 px-8">
        <Text className="text-sm text-center" style={{ color: COLORS.muted }}>
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-row flex-wrap pb-4"
      style={{ gap: GAP, paddingHorizontal: GAP }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            {
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#E8E8E8",
            },
            // Subtle press feedback: shrink and dim a touch while held.
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
          ]}
          onPress={() => onPressItem?.(item.id)}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        </Pressable>
      ))}
    </View>
  );
}
