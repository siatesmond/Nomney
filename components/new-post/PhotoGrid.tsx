import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface PhotoGridProps {
  images: string[];
  removeImage: (uri: string) => void;
  showOptions: () => void;
}

export default function PhotoGrid({
  images = [],
  removeImage,
  showOptions,
}: PhotoGridProps) {
  const { width } = useWindowDimensions();

  const horizontalPadding = 40;
  const gapSpacing = 24;
  const itemSize = (width - (horizontalPadding + gapSpacing)) / 3;

  return (
    <View className="flex-row flex-wrap p-5 gap-3">
      {images.map((uri, index) => (
        <View
          key={`${uri}-${index}`}
          style={{ width: itemSize, height: itemSize }}
          className="relative"
        >
          <Image source={{ uri }} className="w-full h-full rounded-xl" />

          {/* Delete Button */}
          <TouchableOpacity
            className="absolute -top-1 -right-1 bg-black/70 rounded-full w-5 h-5 items-center justify-center z-10"
            onPress={() => removeImage(uri)}
          >
            <Ionicons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}

      {images.length < 6 && (
        <TouchableOpacity
          style={{ width: itemSize, height: itemSize }}
          className="rounded-xl border border-neutral-300 border-dashed items-center justify-center bg-neutral-50/50"
          onPress={showOptions}
        >
          <Ionicons name="add" size={26} color="#F4522A" />
          <Text className="text-xs text-neutral-400 font-medium mt-0.5">
            Add
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
