import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "@/constants/theme";
import { LocationData } from "../../constants/new-post";
import { LocationMapPreview } from "./LocationMapPreview";
import PhotoGrid from "./PhotoGrid";

interface Props {
  title: string;
  setTitle: (t: string) => void;
  caption: string;
  setCaption: (t: string) => void;
  images: string[];
  removeImage: (uri: string) => void;
  showOptions: () => void;
  onTagsPress: () => void;
  selectedTags: string[];
  onRatingsPress: () => void;
  hasRating: boolean;
  overallRating: string | number;
  onLocationPress: () => void;
  location: LocationData | null;
  clearLocation: () => void;
  onPostPress?: () => void;
}

// The new-post form layout: photos, title, caption, and the tag/rating/location rows.
export default function NewPostForm(props: Props) {
  return (
    <View className="flex-1 bg-[#F9F9F9]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-8 pb-4 border-b border-neutral-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl text-neutral-900">✕</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-neutral-900">
          New Post
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <PhotoGrid
          images={props.images}
          removeImage={props.removeImage}
          showOptions={props.showOptions}
        />

        <View className="px-5">
          <View className="border-b border-neutral-200">
            <TextInput
              className="text-base font-medium pt-5 pb-2 text-neutral-900"
              placeholder="Add a title..."
              placeholderTextColor="#999"
              value={props.title}
              onChangeText={props.setTitle}
              maxLength={150}
            />
            <Text className="text-xs text-neutral-400 text-right pb-2">
              {props.title.length}/150
            </Text>
          </View>
          <View className="border-b border-neutral-200">
            <TextInput
              className="text-sm pt-5 pb-2 min-h-[80px] text-neutral-900"
              placeholder="Add a caption..."
              placeholderTextColor="#999"
              value={props.caption}
              onChangeText={props.setCaption}
              multiline
              maxLength={4000}
            />
            <Text className="text-xs text-neutral-400 text-right pb-2">
              {props.caption.length}/4000
            </Text>
          </View>

          {/* Form Rows */}
          <Row
            icon="pricetag-outline"
            label={
              props.selectedTags.length
                ? props.selectedTags.join(", ")
                : "Add tags"
            }
            isActive={!!props.selectedTags.length}
            onPress={props.onTagsPress}
            badge={props.selectedTags.length || undefined}
          />

          <Row
            icon="star-outline"
            label={
              props.hasRating
                ? `Overall: ${props.overallRating} ★`
                : "Add ratings"
            }
            isActive={props.hasRating}
            onPress={props.onRatingsPress}
            badge={props.hasRating ? `${props.overallRating}★` : undefined}
          />

          <Row
            icon="location-outline"
            label={props.location?.name || "Add location"}
            isActive={!!props.location}
            onPress={props.onLocationPress}
            onClear={props.clearLocation}
          />

          {props.location && (
            <LocationMapPreview
              location={props.location}
              className="h-36 rounded-xl my-3"
            />
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="p-5 border-t border-neutral-200">
        <TouchableOpacity
          className="bg-accent rounded-xl py-4 items-center"
          onPress={props.onPostPress}
        >
          <Text className="text-white text-base font-semibold">Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Row = ({ icon, label, isActive, onPress, badge, onClear }: any) => (
  <TouchableOpacity
    className="flex-row items-center gap-4 py-5 border-b border-neutral-200"
    onPress={onPress}
  >
    <Ionicons name={icon} size={22} color={COLORS.accent} />
    <Text
      className={`text-sm flex-1 ${isActive ? "text-neutral-900 font-medium" : "text-neutral-400"}`}
      numberOfLines={1}
    >
      {label}
    </Text>
    {badge && (
      <View className="bg-accent px-2 py-0.5 rounded-full">
        <Text className="text-white text-[10px] font-bold">{badge}</Text>
      </View>
    )}

    {onClear && isActive && (
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="p-1"
      >
        <Ionicons name="close-circle" size={18} color="#CCC" />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);