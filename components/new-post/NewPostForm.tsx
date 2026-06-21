import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { LocationData } from "../../constants/new-post";
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

export default function NewPostForm(props: Props) {
  // Helper for styling active rows
  const getLabelStyle = (isActive: boolean) =>
    `text-sm flex-1 ${isActive ? "text-neutral-900 font-medium" : "text-neutral-400"}`;

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
          <TextInput
            className="text-base font-medium py-5 border-b border-neutral-200 text-neutral-900"
            placeholder="Add a title..."
            placeholderTextColor="#999"
            value={props.title}
            onChangeText={props.setTitle}
          />
          <TextInput
            className="text-sm py-5 min-h-[80px] border-b border-neutral-200 text-neutral-900"
            placeholder="Add a caption..."
            placeholderTextColor="#999"
            value={props.caption}
            onChangeText={props.setCaption}
            multiline
          />

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
            <MapView
              className="h-36 rounded-xl my-3"
              scrollEnabled={false}
              region={{
                latitude: props.location.latitude,
                longitude: props.location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: props.location.latitude,
                  longitude: props.location.longitude,
                }}
              />
            </MapView>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="p-5 border-t border-neutral-200">
        <TouchableOpacity
          className="bg-[#F4522A] rounded-xl py-4 items-center"
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
    <Ionicons name={icon} size={22} color="#F4522A" />
    <Text
      className={`text-sm flex-1 ${isActive ? "text-neutral-900 font-medium" : "text-neutral-400"}`}
      numberOfLines={1}
    >
      {label}
    </Text>
    {badge && (
      <View className="bg-[#F4522A] px-2 py-0.5 rounded-full">
        <Text className="text-white text-[10px] font-bold">{badge}</Text>
      </View>
    )}

    {/* CHANGE HERE: Only show the clear cross if onClear exists AND the row is active (has data) */}
    {onClear && isActive && (
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // Prevents clicking the cross from firing the row's onPress
          onClear();
        }}
        className="p-1" // Adds a nice, easy-to-tap hit box
      >
        <Ionicons name="close-circle" size={18} color="#CCC" />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);
