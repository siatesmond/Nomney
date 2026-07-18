import { COLORS } from "@/constants/theme";
import { useOpenLocationOnMap } from "@/hooks/useOpenLocationOnMap";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ImageCarousel } from "../ImageCarousel";
import { Avatar } from "../UserAvatar";
import { PostActions } from "./PostActions";
import { RatingsGrid } from "./RatingsGrid";

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
  latitude?: number | null;
  longitude?: number | null;
  distance?: string;
  liked?: boolean;
  saved?: boolean;
  ratings?: {
    food: number | null;
    service: number | null;
    environment: number | null;
    cleanliness: number | null;
  };
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
};

function PostCardComponent({
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
  latitude,
  longitude,
  distance,
  liked,
  saved,
  ratings,
  onLike,
  onComment,
  onSave,
}: PostCardProps) {
  const [cardWidth, setCardWidth] = useState(0);
  const router = useRouter();
  const openLocationOnMap = useOpenLocationOnMap();
  const hasCoords = latitude != null && longitude != null;

  return (
    <View
      className="bg-white rounded-xl overflow-hidden"
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      {/* Header */}
      <View className="px-4 pt-3 pb-2">
        <TouchableOpacity
          className="flex-row items-center gap-3"
          activeOpacity={0.7}
          disabled={!userId}
          accessibilityRole="button"
          accessibilityLabel={`View ${username}'s profile`}
          onPress={() => router.push(`/user/${userId}`)}
        >
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
        </TouchableOpacity>
      </View>

      {/* Title & Caption */}
      <View className="px-4 py-2">
        <Text className="text-base font-bold text-black mb-1">{title}</Text>
        <Text className="text-sm text-black leading-[18px]">{caption}</Text>
      </View>

      {/* Images */}
      <ImageCarousel imageUrls={imageUrls} cardWidth={cardWidth} />

      {/* Tags */}
      <View className="flex-row flex-wrap px-4 py-2.5 gap-2">
        {categories.map((category, index) => (
          <View
            key={index}
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: COLORS.accentSoft }}
          >
            <Text className="text-xs font-semibold" style={{ color: COLORS.accent }}>
              {category}
            </Text>
          </View>
        ))}
      </View>

      {/* Location — tap to see it on the map */}
      {location && (
        <TouchableOpacity
          className="flex-row items-center pt-2 px-4 pb-3 gap-1.5"
          activeOpacity={0.7}
          disabled={!hasCoords}
          accessibilityRole="button"
          accessibilityLabel={`Show ${location} on the map`}
          onPress={() =>
            openLocationOnMap({
              latitude: latitude!,
              longitude: longitude!,
              name: location,
            })
          }
        >
          <Ionicons name="location-outline" size={20} color={COLORS.accent} />
          <Text className="text-xs text-black">
            {location}
            {distance && `, ${distance} away`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Ratings */}
      {ratings && <RatingsGrid {...ratings} />}

      {/* Actions */}
      <View className="py-2 px-4">
        <PostActions
          liked={liked}
          saved={saved}
          likes={likes}
          comments={comments}
          saves={saves}
          onLike={onLike}
          onComment={onComment}
          onSave={onSave}
        />
      </View>
    </View>
  );
}

// Memoized so a like/save on one card doesn't re-render the whole feed.
export const PostCard = memo(PostCardComponent);
