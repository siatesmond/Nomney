import { CommentSheet } from "@/components/comments/CommentSheet";
import { DetailImageCarousel } from "@/components/post/DetailImageCarousel";
import { PostHeaderOverlay } from "@/components/post/PostHeaderOverlay";
import { RatingRing } from "@/components/post/RatingRing";
import { RatingsGrid } from "@/components/post/RatingsGrid";
import { usePostDetail } from "@/hooks/usePostDetail";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useRef } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
}

const COLORS = {
  ink: "#1C1917",
  paper: "#FAF7F2",
  line: "#E9E2D6",
  accent: "#F4522A",
  muted: "#8A8378",
};

export function PostDetailModal({ postId, onClose }: PostDetailModalProps) {
  const commentSheetRef = useRef<BottomSheetModal>(null);
  const {
    postData,
    loading,
    liked,
    saved,
    likesCount,
    savesCount,
    commentCount,
    sheetComments,
    toggleLike,
    toggleSave,
    openComments,
    handleNewComment,
  } = usePostDetail(postId, commentSheetRef);

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
  const sortedImages = (postData.post_image || [])
    .slice()
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

  const postDate = postData.created_at
    ? new Date(postData.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  const tags = (postData.post_categories || [])
    .map((item: any) => item.categories)
    .filter((c: any) => c?.name);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ backgroundColor: COLORS.paper }} className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Image + header overlay */}
            <View className="relative">
              <DetailImageCarousel images={sortedImages} />
              <PostHeaderOverlay
                avatarUrl={postData.profiles?.avatar_url ?? null}
                username={postData.profiles?.username ?? null}
                locationName={postData.location_name ?? null}
                onClose={onClose}
              />
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
              {/* Title + overall rating */}
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

              {/* Action row */}
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

                <TouchableOpacity
                  className="flex-row items-center gap-1.5 py-2 px-3 mr-2"
                  onPress={openComments}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#999" />
                  <Text className="text-xs text-gray-500 font-semibold">
                    {commentCount}
                  </Text>
                </TouchableOpacity>

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

              {/* Ratings breakdown */}
              <RatingsGrid
                food={postData.rating_food}
                service={postData.rating_service}
                environment={postData.rating_environment}
                cleanliness={postData.rating_cleanliness}
              />

              {/* Categories */}
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

              {/* Likes preview */}
              {likesArray.length > 0 && (
                <View
                  className="px-5 py-3.5 flex-row items-center"
                  style={{ borderBottomWidth: 1, borderColor: COLORS.line }}
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

              {/* Comments */}
              <View className="px-5 pt-5 pb-10">
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    style={{ color: COLORS.ink }}
                    className="text-xs font-black uppercase tracking-wider"
                  >
                    Comments ({commentCount})
                  </Text>
                  <TouchableOpacity onPress={openComments} activeOpacity={0.7}>
                    <Text
                      style={{ color: COLORS.accent }}
                      className="text-xs font-bold"
                    >
                      Add comment
                    </Text>
                  </TouchableOpacity>
                </View>

                {commentsArray.length === 0 ? (
                  <TouchableOpacity
                    className="py-6 items-center"
                    onPress={openComments}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{ color: COLORS.muted }}
                      className="text-xs font-medium"
                    >
                      No comments yet. Start the conversation!
                    </Text>
                  </TouchableOpacity>
                ) : (
                  commentsArray.map((comment: any, idx: number) => {
                    const commentDate = comment.created_at
                      ? new Date(comment.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )
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

          <CommentSheet
            ref={commentSheetRef}
            postId={postId}
            comments={sheetComments}
            onNewCommentAdded={handleNewComment}
          />
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}