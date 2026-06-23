import { Image } from "expo-image";
import { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

type GridPost = {
  id: string;
  imageUrl: string;
};

interface ImageGridProps {
  posts: GridPost[];
  onPostClick: (postId: string) => void;
}

export function ImageGrid({ posts = [], onPostClick }: ImageGridProps) {
  useEffect(() => {
    console.log("ImageGrid received post nodes:", posts);
  }, [posts]);

  return (
    <View style={styles.grid}>
      {posts.map((post, index) => (
        <TouchableOpacity
          key={`${post.id}-${index}`}
          style={styles.gridItem}
          activeOpacity={0.8}
          onPress={() => onPostClick(post.id)}
        >
          <Image
            source={post.imageUrl}
            style={styles.gridImage}
            contentFit="cover"
            onError={(e) =>
              console.log(
                `Error loading asset at index ${index} for post ${post.id}:`,
                e.error,
              )
            }
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
