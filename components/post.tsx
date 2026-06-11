import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./UserAvatar";
import { ImageCarousel } from "./ImageCarousel";

type PostCardProps = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  timeAgo: string;
  title: string;
  caption: string;
  imageUrls: string[];
  categories: string[];
  likes: number;
  comments: number;
  saves: number;
  location?: string;
  distance?: string;
  liked?: boolean;
  saved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
};

export function PostCard({
  userId,
  username,
  avatarUrl,
  timeAgo,
  title,
  caption,
  imageUrls,
  categories,
  likes,
  comments,
  saves,
  location,
  distance,
  liked,
  saved,
  onLike,
  onComment,
  onSave,
}: PostCardProps) {
  const [cardWidth, setCardWidth] = useState(0);

  return (
    <View
      className="bg-white rounded-xl overflow-hidden"
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      {/* Header */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center gap-3">
          <Avatar
            avatarUrl={avatarUrl}
            displayName={username}
            size="sm"
            shadow={false}
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900">
              {username}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">{timeAgo}</Text>
          </View>
        </View>
      </View>

      {/* Title & Caption */}
      <View className="px-4 py-2">
        <Text className="text-base font-bold text-black mb-1">{title}</Text>
        <Text className="text-sm text-black leading-[18px]">{caption}</Text>
      </View>

      {/* Image Horizontal FlatList */}
      <ImageCarousel imageUrls={imageUrls} cardWidth={cardWidth} />

      {/* Tags */}
      <View className="flex-row flex-wrap px-4 py-2.5 gap-2">
        {categories.map((category, index) => (
          <View key={index} className="bg-[#FFE9E8] px-3 py-1.5 rounded-full">
            <Text className="text-xs text-[#FA5A40] font-semibold">{category}</Text>
          </View>
        ))}
      </View>

      {/* Location */}
      {location && (
        <View className="flex-row items-center px-4 pb-3 gap-1.5">
          <Ionicons name="location-outline" size={20} color="#FA5A40" />
          <Text className="text-xs text-black">
            {location}
            {distance && `, ${distance} away`}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row justify-end py-2 px-4">
        {/* Like */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 py-2 px-3 mr-2"
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#F4522A" : "#999"}
          />
          <Text className="text-xs text-gray-500 font-semibold">{likes}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 py-2 px-3 mr-2"
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#999" />
          <Text className="text-xs text-gray-500 font-semibold">
            {comments}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 py-2 px-3"
          onPress={onSave}
          activeOpacity={0.7}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? "#F4522A" : "#999"}
          />
          <Text className="text-xs text-gray-500 font-semibold">{saves}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
