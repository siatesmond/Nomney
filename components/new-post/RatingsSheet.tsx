import { RATING_CATEGORIES, RatingKey } from "@/constants/new-post";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { RefObject } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RatingsSheetProps {
  sheetRef: RefObject<BottomSheet>;
  ratings: Record<RatingKey, number>;
  hasRating: boolean;
  overallRating: () => string | number;
  setRating: (category: RatingKey, value: number) => void;
}

export default function RatingsSheet({
  sheetRef,
  ratings,
  hasRating,
  overallRating,
  setRating,
}: RatingsSheetProps) {
  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={["55%"]}
      enablePanDownToClose
    >
      <BottomSheetView className="flex-1 px-5 pb-3 gap-3">
        <Text className="text-base font-semibold text-neutral-900 text-center">
          Add Ratings
        </Text>

        {/* Overall Score Banner */}
        <View className="items-center py-3 border-b border-neutral-100 mb-1">
          <Text className="text-5xl font-bold text-[#F4522A]">
            {hasRating ? overallRating() : "—"}
          </Text>
          <Text className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Overall
          </Text>
        </View>

        {/* Dynamic Category Mapping */}
        {RATING_CATEGORIES.map(({ key, label, icon }) => (
          <View
            key={key}
            className="flex-row items-center justify-between py-2 border-b border-neutral-100"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name={icon} size={18} color="#F4522A" />
              <Text className="text-sm font-medium text-neutral-900">
                {label}
              </Text>
            </View>

            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(key, star)}
                >
                  <Ionicons
                    name={star <= ratings[key] ? "star" : "star-outline"}
                    size={26}
                    color={star <= ratings[key] ? "#F4522A" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Confirmation Button */}
        <TouchableOpacity
          className="bg-[#F4522A] rounded-xl py-4 items-center mt-2"
          onPress={() => sheetRef.current?.close()}
        >
          <Text className="text-white text-base font-semibold">Done</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}