// 3-column grid of post thumbnails. Tap one to open it. Shows its own
// loading / empty state.
import { COLORS } from "@/constants/theme";
import { ImageGridItem } from "@/constants/types";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const GRID_COLUMNS = 3;
const GAP = 3;

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
  // Measure the width at runtime rather than at module load: on the New
  // Architecture, Dimensions.get("window") can be 0 during early module
  // evaluation, which would make the tiles zero/negative-sized and invisible.
  const { width } = useWindowDimensions();
  const imageSize = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

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
      {/* TEMP DIAGNOSTIC: show the first image URL + any load error. */}
      <Text selectable style={{ fontSize: 9, color: "red", width: "100%", padding: 4 }}>
        URL: {items[0]?.imageUrl ?? "(none)"}
      </Text>
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            {
              width: imageSize,
              height: imageSize,
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
            resizeMode="cover"
            onError={(e) =>
              console.log("IMG ERROR", item.imageUrl, e.nativeEvent)
            }
          />
        </Pressable>
      ))}
    </View>
  );
}
