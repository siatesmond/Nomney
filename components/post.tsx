import { useAuthContext } from "@/hooks/use-auth-context";
import { likePost, unlikePost } from "@/lib/likes";
import { getPostDetail } from "@/lib/posts";
import { savePost, unsavePost } from "@/lib/save";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  ink: "#1C1917",
  paper: "#FAF7F2",
  line: "#E9E2D6",
  accent: "#F4522A",
  accentSoft: "#FFEDE5",
  teal: "#2A6F6F",
  tealSoft: "#E7F1F1",
  gold: "#E8A23D",
  muted: "#8A8378",
};

function RatingRing({
  rating,
  size = 72,
}: {
  rating: number | null;
  size?: number;
}) {
  const hasRating = rating !== null && rating !== undefined;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: hasRating ? COLORS.accent : COLORS.line,
        padding: 4,
      }}
      className="items-center justify-center"
    >
      <View
        style={{
          width: size - 16,
          height: size - 16,
          borderRadius: (size - 16) / 2,
          borderWidth: 1,
          borderColor: hasRating ? COLORS.accentSoft : COLORS.line,
        }}
        className="items-center justify-center"
      >
        {hasRating ? (
          <Text style={{ color: COLORS.accent }} className="text-lg font-black">
            {rating!.toFixed(1)}
          </Text>
        ) : (
          <Text
            style={{ color: COLORS.muted }}
            className="text-[10px] font-bold"
          >
            N/A
          </Text>
        )}
      </View>
    </View>
  );
}

export function PostDetailModal({ postId, onClose }: PostDetailModalProps) {
  const { profile } = useAuthContext();

  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Interactive like/save state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);

  useEffect(() => {
    fetchFullPostDetails();
  }, [postId]);

  const fetchFullPostDetails = async () => {
    try {
      setLoading(true);
      const data = await getPostDetail(postId);

      setPostData(data);

      // Seed interactive state from the fetched arrays
      const likes = data?.likes || [];
      const saves = data?.saves || [];
      setLikesCount(likes.length);
      setSavesCount(saves.length);
      setLiked(likes.some((l: any) => l.user_id === profile?.id));
      setSaved(saves.some((s: any) => s.user_id === profile?.id));
    } catch (error) {
      console.error("Error fetching full post:", error);
    } finally {
      setLoading(false);
    }
  };

  // Like / unlike with optimistic UI + revert
  const toggleLike = async () => {
    if (!profile?.id) return;
    const wasLiked = liked;

    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      if (wasLiked) await unlikePost(postId, profile.id);
      else await likePost(postId, profile.id);
    } catch (err) {
      console.log("Failed to toggle like:", err);
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  // Save / unsave with optimistic UI + revert
  const toggleSave = async () => {
    if (!profile?.id) return;
    const wasSaved = saved;

    setSaved(!wasSaved);
    setSavesCount((c) => (wasSaved ? c - 1 : c + 1));

    try {
      if (wasSaved) await unsavePost(postId, profile.id);
      else await savePost(postId, profile.id);
    } catch (err) {
      console.log("Failed to toggle save:", err);
      setSaved(wasSaved);
      setSavesCount((c) => (wasSaved ? c + 1 : c - 1));
    }
  };

  if (loading) {
    return (
      <View
        style={{ backgroundColor: COLORS.paper }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!postData) return null;

  const likesArray = postData.likes || [];
  const commentsArray = postData.comments || [];

  const sortedImages = (postData.post_image || []).sort(
    (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0),
  );

  const postDate = postData.created_at
    ? new Date(postData.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== activeImageIndex) {
      setActiveImageIndex(slide);
    }
  };

  const renderStars = (rating: number | null) => {
    if (rating === null || rating === undefined) {
      return (
        <Text style={{ color: COLORS.muted }} className="text-xs font-semibold">
          N/A
        </Text>
      );
    }
    const rounded = Math.round(rating);
    return (
      <View className="flex-row">
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rounded ? "star" : "star-outline"}
            size={14}
            color={COLORS.gold}
            style={{ marginLeft: i === 0 ? 0 : 2 }}
          />
        ))}
      </View>
    );
  };

  const tags = (postData.post_categories || [])
    .map((item: any) => item.categories)
    .filter((c: any) => c?.name);

  return (
    <View style={{ backgroundColor: COLORS.paper }} className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className="relative w-full h-[420px]">
          {sortedImages.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
            >
              {sortedImages.map((img: any, idx: number) => (
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
              <Ionicons name="image-outline" size={48} color={COLORS.muted} />
            </View>
          )}

          <View className="absolute top-12 left-3 right-3 flex-row items-center justify-between">
            <View
              className="flex-row items-center px-2.5 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(28,25,23,0.55)" }}
            >
              <Image
                source={{
                  uri:
                    postData.profiles?.avatar_url ||
                    "https://via.placeholder.com/150",
                }}
                className="w-7 h-7 rounded-full bg-slate-200"
              />
              <View style={{ marginLeft: 8 }}>
                <Text
                  className="text-white text-xs font-bold"
                  numberOfLines={1}
                >
                  {postData.profiles?.username || "food_reviewer"}
                </Text>
                {postData.location_name && (
                  <View className="flex-row items-center">
                    <Ionicons name="location-sharp" size={10} color="#FFD9CC" />
                    <Text
                      className="text-[10px] text-white/85 font-medium"
                      numberOfLines={1}
                      style={{ maxWidth: 160, marginLeft: 3 }}
                    >
                      {postData.location_name}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(28,25,23,0.55)" }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={17} color="#fff" />
            </TouchableOpacity>
          </View>

          {sortedImages.length > 1 && (
            <View
              className="absolute left-0 right-0 flex-row justify-center items-center"
              style={{ bottom: 44 }}
            >
              {sortedImages.map((_, idx) => {
                const isActive = idx === activeImageIndex;
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

        <View
          style={{
            marginTop: -28,
            backgroundColor: COLORS.paper,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between px-5 pt-5">
            <View className="flex-1 mr-4">
              <Text
                style={{ color: COLORS.ink }}
                className="text-3xl font-black leading-tight"
              >
                {postData.title || "Untitled Review"}
              </Text>
            </View>
            <RatingRing rating={postData.overall_rating} />
          </View>

          {(postData.caption || postDate) && (
            <View className="px-5 pt-2 pb-4">
              {postData.caption && (
                <Text
                  style={{ color: COLORS.ink }}
                  className="text-[15px] leading-relaxed italic"
                >
                  "{postData.caption}"
                </Text>
              )}
              {postDate && (
                <Text
                  style={{ color: COLORS.muted }}
                  className="text-xs font-medium mt-2"
                >
                  {postDate}
                </Text>
              )}
            </View>
          )}

          {/* Actions row — matches PostCard's like/comment/save styling */}
          <View
            className="flex-row justify-end px-5 mt-2 pb-4"
            style={{ borderBottomWidth: 1, borderColor: COLORS.line }}
          >
            <TouchableOpacity
              className="flex-row items-center gap-1.5 py-2 px-3 mr-2"
              onPress={toggleLike}
              activeOpacity={0.7}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#F4522A" : "#999"}
              />
              <Text className="text-xs text-gray-500 font-semibold">
                {likesCount}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5 py-2 px-3 mr-2">
              <Ionicons name="chatbubble-outline" size={20} color="#999" />
              <Text className="text-xs text-gray-500 font-semibold">
                {commentsArray.length}
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-1.5 py-2 px-3"
              onPress={toggleSave}
              activeOpacity={0.7}
            >
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={saved ? "#F4522A" : "#999"}
              />
              <Text className="text-xs text-gray-500 font-semibold">
                {savesCount}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="px-5 py-4 flex-row flex-wrap"
            style={{
              borderBottomWidth: 1,
              borderColor: COLORS.line,
            }}
          >
            <View className="w-1/2 flex-row items-center justify-between pr-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="fast-food-outline"
                  size={14}
                  color={COLORS.muted}
                />
                <Text
                  style={{ color: COLORS.muted, marginLeft: 6 }}
                  className="text-xs font-semibold"
                >
                  Food
                </Text>
              </View>
              {renderStars(postData.rating_food)}
            </View>
            <View className="w-1/2 flex-row items-center justify-between pl-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={COLORS.muted}
                />
                <Text
                  style={{ color: COLORS.muted, marginLeft: 6 }}
                  className="text-xs font-semibold"
                >
                  Service
                </Text>
              </View>
              {renderStars(postData.rating_service)}
            </View>
            <View
              className="w-1/2 flex-row items-center justify-between pr-3"
              style={{ marginTop: 14 }}
            >
              <View className="flex-row items-center">
                <Ionicons name="leaf-outline" size={14} color={COLORS.muted} />
                <Text
                  style={{ color: COLORS.muted, marginLeft: 6 }}
                  className="text-xs font-semibold"
                >
                  Environment
                </Text>
              </View>
              {renderStars(postData.rating_environment)}
            </View>
            <View
              className="w-1/2 flex-row items-center justify-between pl-3"
              style={{ marginTop: 14 }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={COLORS.muted}
                />
                <Text
                  style={{ color: COLORS.muted, marginLeft: 6 }}
                  className="text-xs font-semibold"
                >
                  Clean
                </Text>
              </View>
              {renderStars(postData.rating_cleanliness)}
            </View>
          </View>

          {/* Categories — soft-pink pills, matching PostCard */}
          {tags.length > 0 && (
            <View
              className="px-5 py-3.5 flex-row flex-wrap gap-2"
              style={{ borderBottomWidth: 1, borderColor: COLORS.line }}
            >
              {tags.map((category: any, index: number) => (
                <View
                  key={index}
                  className="bg-[#FFE9E8] px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs text-[#FA5A40] font-semibold">
                    {category.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {likesArray.length > 0 && (
            <View
              className="px-5 py-3.5 flex-row items-center"
              style={{
                borderBottomWidth: 1,
                borderColor: COLORS.line,
              }}
            >
              <View className="flex-row" style={{ marginLeft: 4 }}>
                {likesArray.slice(0, 3).map((like: any, idx: number) => (
                  <Image
                    key={idx}
                    source={{
                      uri:
                        like.profiles?.avatar_url ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-6 h-6 rounded-full bg-slate-200"
                    style={{
                      marginLeft: -8,
                      borderWidth: 1.5,
                      borderColor: COLORS.paper,
                    }}
                  />
                ))}
              </View>
              <Text
                style={{ color: COLORS.muted, marginLeft: 10 }}
                className="text-xs font-medium flex-1"
              >
                Liked by{" "}
                <Text style={{ color: COLORS.ink }} className="font-bold">
                  {likesArray[0]?.profiles?.username || "someone"}
                </Text>
                {likesArray.length > 1
                  ? ` and ${likesArray.length - 1} others`
                  : ""}
              </Text>
            </View>
          )}

          <View className="px-5 pt-5 pb-10">
            <Text
              style={{ color: COLORS.ink }}
              className="text-xs font-black uppercase tracking-wider mb-3"
            >
              Comments ({commentsArray.length})
            </Text>

            {commentsArray.length === 0 ? (
              <View className="py-6 items-center">
                <Text
                  style={{ color: COLORS.muted }}
                  className="text-xs font-medium"
                >
                  No comments yet. Start the conversation!
                </Text>
              </View>
            ) : (
              commentsArray.map((comment: any, idx: number) => {
                const commentDate = comment.created_at
                  ? new Date(comment.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                  : "";

                return (
                  <View
                    key={comment.id}
                    className="flex-row items-start py-3.5"
                    style={{
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderColor: COLORS.line,
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          comment.profiles?.avatar_url ||
                          "https://via.placeholder.com/150",
                      }}
                      className="w-8 h-8 rounded-full bg-slate-200"
                    />
                    <View className="flex-1" style={{ marginLeft: 12 }}>
                      <View className="flex-row items-baseline justify-between">
                        <Text
                          style={{ color: COLORS.ink }}
                          className="text-xs font-bold"
                        >
                          {comment.profiles?.username || "user"}
                        </Text>
                        <Text
                          style={{ color: COLORS.muted }}
                          className="text-[10px] font-medium"
                        >
                          {commentDate}
                        </Text>
                      </View>
                      <Text
                        style={{ color: COLORS.ink }}
                        className="text-[13px] mt-1.5 leading-relaxed"
                      >
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}