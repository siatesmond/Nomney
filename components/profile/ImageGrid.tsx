import { Dimensions, Image, TouchableOpacity, View } from "react-native";

import { GridPost } from "@/constants/types";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

type ImageGridProps = {
  posts: GridPost[];
  onPostClick: (postId: string) => void;
};

export function ImageGrid({ posts, onPostClick }: ImageGridProps) {
  return (
    <View
      className="flex-row flex-wrap pb-4"
      style={{ gap: GAP, paddingHorizontal: GAP }}
    >
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          activeOpacity={0.9}
          className="rounded-[10px] overflow-hidden bg-[#E8E8E8]"
          style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
          onPress={() => onPostClick(post.id)}
        >
          <Image source={{ uri: post.imageUrl }} className="w-full h-full" />
        </TouchableOpacity>
      ))}
    </View>
  );
}