import { Image } from "expo-image";
import { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

interface ImageGridProps {
  images: string[];
}

export function ImageGrid({ images }: ImageGridProps) {
  useEffect(() => {
    console.log("ImageGrid received URIs:", images);
  }, [images]);

  return (
    <View style={styles.grid}>
      {images.map((uri, index) => (
        <TouchableOpacity key={`${uri}-${index}`} style={styles.gridItem}>
          <Image
            source={uri} // Note: expo-image handles strings directly
            style={styles.gridImage}
            contentFit="cover"
            // 2. Debug: Log error details
            onError={(e) => console.log(`Error at ${index}:`, e.error)}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    paddingHorizontal: GAP,
    paddingBottom: 16,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E8E8E8",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
});
