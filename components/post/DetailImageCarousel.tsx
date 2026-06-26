// Swipeable photo gallery for the post detail view, with dots at the bottom.
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MUTED = "#8A8378";

export function DetailImageCarousel({ images }: { images: any[] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event: any) => {
        const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (slide !== activeIndex) setActiveIndex(slide);
    };

    return (
        <View className="relative w-full h-[420px]">
            {images.length > 0 ? (
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    bounces={false}
                >
                    {images.map((img: any, idx: number) => (
                        <Image
                            key={idx}
                            source={{ uri: img.image_url }}
                            style={{ width: SCREEN_WIDTH, height: 420 }}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>
            ) : (
                <View className="w-full h-full bg-slate-200 items-center justify-center">
                    <Ionicons name="image-outline" size={48} color={MUTED} />
                </View>
            )}

            {images.length > 1 && (
                <View
                    className="absolute left-0 right-0 flex-row justify-center items-center"
                    style={{ bottom: 44 }}
                >
                    {images.map((_: any, idx: number) => {
                        const isActive = idx === activeIndex;
                        return (
                            <View
                                key={idx}
                                style={{
                                    width: isActive ? 18 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    marginLeft: idx === 0 ? 0 : 10,
                                    backgroundColor: isActive
                                        ? "#FFFFFF"
                                        : "rgba(255, 255, 255, 0.45)",
                                }}
                            />
                        );
                    })}
                </View>
            )}
        </View>
    );
}