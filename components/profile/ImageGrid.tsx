// 3-column grid of post thumbnails. Tap one to open it.
// Uses expo-image so thumbnails are cached instead of re-downloaded on scroll,
// and shows its own loading / empty state.
import { COLORS } from "@/constants/theme";
import { ImageGridItem } from "@/constants/types";
import { Image } from "expo-image";
import {
  ActivityIndicator,
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
    <View className="pb-4">
      {/* TEMP DIAGNOSTIC */}
      <Text style={{ color: "red", fontSize: 12, padding: 4 }}>
        DIAG imageSize={Math.round(imageSize)} items={items.length}
      </Text>
      <View
        className="flex-row flex-wrap"
        style={{ gap: GAP, paddingHorizontal: GAP }}
      >
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            style={{
              width: imageSize > 0 ? imageSize : 100,
              height: imageSize > 0 ? imageSize : 100,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: index % 2 === 0 ? "#F4522A" : "#2A7FF4",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => onPressItem?.(item.id)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>{index + 1}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
