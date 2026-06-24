import { Dimensions, Image, TouchableOpacity, View } from 'react-native';

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
    <View
      className="flex-row flex-wrap pb-4"
      style={{ gap: GAP, paddingHorizontal: GAP }}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.9}
          className="rounded-[10px] overflow-hidden bg-[#E8E8E8]"
          style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
          onPress={() => onPressItem?.(item.id)}
        >
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
        </TouchableOpacity>
      ))}
    </View>
  );
}