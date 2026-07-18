// 3-column grid of post thumbnails. Tap one to open it.
import { ImageGridItem } from '@/constants/types';
import { Dimensions, Image, Pressable, View } from 'react-native';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

type ImageGridProps = {
  items: ImageGridItem[];
  onPressItem?: (id: string) => void;
};

export function ImageGrid({ items, onPressItem }: ImageGridProps) {
  return (
    <View
      className="flex-row flex-wrap pb-4"
      style={{ gap: GAP, paddingHorizontal: GAP }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          // All styling is inline (no className) so the fixed width/height are
          // always applied — a NativeWind className + function-style mix can
          // drop the size and make tiles disappear.
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
          <Image source={{ uri: item.imageUrl }} style={{ width: "100%", height: "100%" }} />
        </Pressable>
      ))}
    </View>
  );
}