// components/profile/ImageGrid.tsx
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GAP = 3;
const IMAGE_SIZE = (width - (GRID_COLUMNS + 1) * GAP) / GRID_COLUMNS;

type ImageGridItem = {
  id: string;
  imageUrl: string;
};

type ImageGridProps = {
  items: ImageGridItem[];
  onPressItem?: (id: string) => void;
};

export function ImageGrid({ items, onPressItem }: ImageGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.9}
          style={styles.gridItem}
          onPress={() => onPressItem?.(item.id)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: GAP,
    paddingBottom: 16,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});