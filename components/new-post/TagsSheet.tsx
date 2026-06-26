// Bottom sheet to pick tags/categories. You can search the list or add a new one.
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { RefObject, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface TagsSheetProps {
  sheetRef: RefObject<BottomSheet>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  addCustomTagWithType: (tag: string, type: "food_type" | "meal_type") => void;
  foodTypes: string[];
  mealTypes: string[];
}

export default function TagsSheet({
  sheetRef,
  selectedTags,
  toggleTag,
  addCustomTagWithType,
  foodTypes = [],
  mealTypes = [],
}: TagsSheetProps) {
  const [search, setSearch] = useState("");

  const formattedSearch = search.trim();
  const isSearching = formattedSearch.length > 0;

  const filteredFood = isSearching
    ? foodTypes.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : foodTypes.slice(0, 10);

  const filteredMeal = isSearching
    ? mealTypes.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : mealTypes.slice(0, 10);

  const tagExists = [...foodTypes, ...mealTypes].some(
    (t) => t.toLowerCase() === formattedSearch.toLowerCase(),
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={["60%", "90%"]}
      enablePanDownToClose
    >
      <View className="flex-1 px-5 pb-3 gap-4">
        <Text className="text-base font-semibold text-neutral-900 text-center">
          Tags & Categories
        </Text>

        {/* Fixed Search Input Wrapper */}
        <View className="border border-neutral-200 rounded-lg bg-neutral-50 h-12 px-4 flex-row items-center">
          <TextInput
            className="flex-1 text-sm text-neutral-900"
            style={{
              height: "100%",
              paddingTop: 0,
              paddingBottom: 0,
              textAlignVertical: "center",
              includeFontPadding: false,
            }}
            placeholder="Search or add categories..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Selected Tags Preview */}
        {selectedTags.length > 0 && (
          <View className="border-b border-neutral-100 pb-3">
            <Text className="text-[10px] font-bold text-neutral-400 uppercase mb-2">
              Selected
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className="flex-row items-center bg-accent-tint border border-accent-border px-3 py-1 rounded-full"
                >
                  <Text className="text-xs text-accent font-medium mr-1.5">
                    {tag}
                  </Text>
                  <Text className="text-[10px] text-accent font-bold">
                    ✕
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Create Tag Section */}
        {isSearching && !tagExists && (
          <View className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <Text className="text-xs text-neutral-500 mb-2 font-medium">
              "{formattedSearch}" doesn't exist. Add as:
            </Text>
            <View className="flex-row gap-2">
              <CreateBtn
                label="Food Type"
                onPress={() =>
                  addCustomTagWithType(formattedSearch, "food_type")
                }
              />
              <CreateBtn
                label="Meal Type"
                onPress={() =>
                  addCustomTagWithType(formattedSearch, "meal_type")
                }
                color="bg-neutral-800"
              />
            </View>
          </View>
        )}

        {/* Tags List */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Section
            title={isSearching ? "Matching Food Types" : "Popular Food Types"}
            tags={filteredFood}
            selected={selectedTags}
            onToggle={toggleTag}
          />
          <Section
            title={isSearching ? "Matching Meal Types" : "Popular Meal Types"}
            tags={filteredMeal}
            selected={selectedTags}
            onToggle={toggleTag}
          />
        </BottomSheetScrollView>

        <TouchableOpacity
          className="bg-accent rounded-xl py-4 items-center"
          onPress={() => sheetRef.current?.close()}
        >
          <Text className="text-white font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

// Sub-components to keep the main view clean
const Section = ({ title, tags, selected, onToggle }: any) => (
  <View className="mb-6">
    <Text className="text-[11px] font-bold text-neutral-400 uppercase mb-3">
      {title}
    </Text>
    <View className="flex-row flex-wrap gap-2">
      {tags.map((tag: string) => (
        <TouchableOpacity
          key={tag}
          onPress={() => onToggle(tag)}
          className={`px-4 py-2 rounded-full border ${selected.includes(tag) ? "bg-accent border-accent" : "border-neutral-200"}`}
        >
          <Text
            className={`text-xs ${selected.includes(tag) ? "text-white" : "text-neutral-700"}`}
          >
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const CreateBtn = ({ label, onPress, color = "bg-accent" }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-1 ${color} py-2 rounded-lg items-center`}
  >
    <Text className="text-white text-xs font-semibold">+ {label}</Text>
  </TouchableOpacity>
);
