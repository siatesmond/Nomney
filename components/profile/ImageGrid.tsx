import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

type GridPost = {
  id: string;
  imageUrl: string;
};

type ImageGridProps = {
  posts: GridPost[];
  onPostClick: (postId: string) => void;
};

export function ImageGrid({ posts, onPostClick }: ImageGridProps) {
  return (
    <View style={styles.grid}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          activeOpacity={0.9}
          style={styles.gridItem}
          onPress={() => onPostClick(post.id)}
        >
          <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
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
    resizeMode: "cover",
  },
});
