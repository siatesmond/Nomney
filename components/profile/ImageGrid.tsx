// 3-column grid of post thumbnails. Tap one to open it. Shows its own
// loading / empty state.
import { COLORS } from "@/constants/theme";
import { ImageGridItem } from "@/constants/types";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
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
  const [imgErr, setImgErr] = useState<string>(""); // TEMP diagnostic

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
        {"\n"}ERR: {imgErr || "(no error yet)"}
      </Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#E8E8E8",
          }}
          onPress={() => onPressItem?.(item.id)}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: imageSize, height: imageSize }}
            resizeMode="cover"
            onError={(e) => {
              console.log("IMG ERROR", item.imageUrl, e.nativeEvent);
              setImgErr(e.nativeEvent?.error ?? "unknown");
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
