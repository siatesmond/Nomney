import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { FlatList, View } from "react-native";

type ImageCarouselProps = {
  imageUrls: string[];
  cardWidth: number;
};

function Paginator({
  total,
  currentIndex,
}: {
  total: number;
  currentIndex: number;
}) {
  if (total <= 1) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        marginTop: 8,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i.toString()}
          style={{
            width: i === currentIndex ? 16 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === currentIndex ? COLORS.accent : "#D1D5DB",
          }}
        />
      ))}
    </View>
  );
}

export function ImageCarousel({ imageUrls, cardWidth }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    const first = viewableItems[0];
    if (first && first.index != null) {
      setCurrentIndex(first.index); // updates index during scroll
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View className="py-2">
      {imageUrls?.length > 0 ? (
        <FlatList
          data={imageUrls}
          horizontal
          pagingEnabled // stops at each img boundary
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()} // to update when int with db
          style={{ width: cardWidth }} // constraints img to card width
          onViewableItemsChanged={viewableItemsChanged} // for scroll position
          viewabilityConfig={viewConfig} // viewable when 50% visible
          getItemLayout={(_, index) => ({
            length: cardWidth,
            offset: cardWidth * index,
            index,
          })}
          renderItem={({ item }) => (
            <View
              style={{
                width: cardWidth,
                height: 220,
              }}
            >
              <Image
                source={{ uri: item }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            </View>
          )}
        />
      ) : (
        <View className="w-full h-56 bg-gray-200 items-center justify-center">
          <Ionicons name="image-outline" size={30} color="#999" />
        </View>
      )}
      <Paginator total={imageUrls.length} currentIndex={currentIndex} />
    </View>
  );
}
