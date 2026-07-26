// Full post view: photos, ratings, caption, likes and comments.
import { Avatar } from "@/components/UserAvatar";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { DetailImageCarousel } from "@/components/post/DetailImageCarousel";
import { PostActions } from "@/components/post/PostActions";
import { PostHeaderOverlay } from "@/components/post/PostHeaderOverlay";
import { RatingRing } from "@/components/post/RatingRing";
import { RatingsGrid } from "@/components/post/RatingsGrid";
import { Tag } from "@/components/ui/Tag";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useOpenLocationOnMap } from "@/hooks/useOpenLocationOnMap";
import { usePostDetail } from "@/hooks/usePostDetail";
import { addComment } from "@/lib/comments";
import { deletePost } from "@/lib/posts";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
  // Called after the post is successfully deleted, so the screen underneath
  // (e.g. a profile grid) can refresh itself — closing this modal doesn't fire
  // a navigation focus event, so the parent won't otherwise know to reload.
  onDeleted?: () => void;
}

export function PostDetailModal({ postId, onClose, onDeleted }: PostDetailModalProps) {
  const router = useRouter();
  const { profile: currentUser } = useAuthContext();
  const openLocationOnMap = useOpenLocationOnMap();
  const commentSheetRef = useRef<BottomSheetModal>(null);
  const [commentText, setCommentText] = useState("");
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

  const authorId = postData.profiles?.id ?? null;
  const isOwner = !!authorId && authorId === currentUser?.id;

  const goToAuthorProfile = () => {
    if (!authorId) return;
    onClose();
    router.push(`/user/${authorId}`);
  };

  // Close the modal first, then open the edit screen (the modal sits above the
  // navigation stack, so a push would otherwise be hidden behind it).
  const goToEdit = () => {
    onClose();
    router.push(`/edit-post/${postId}`);
  };

  // Same idea: close the modal, then jump to the Map tab focused on this spot.
  const hasCoords =
    postData.latitude != null && postData.longitude != null;
  const goToLocation = () => {
    if (!hasCoords) return;
    onClose();
    openLocationOnMap({
      latitude: postData.latitude,
      longitude: postData.longitude,
      name: postData.location_name ?? undefined,
    });
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text || !currentUser?.id) return;
    try {
      const newComment = await addComment(postId, currentUser.id, text);
      handleNewComment(newComment);
      setCommentText("");
    } catch (err: any) {
      Alert.alert("Comment failed", err.message || "Please try again.");
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete post?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(postId);
            onDeleted?.();
            onClose();
          } catch (err: any) {
            Alert.alert("Delete failed", err.message || "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ backgroundColor: COLORS.paper }} className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image */}
            <View className="relative">
              <DetailImageCarousel images={sortedImages} />
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
                className="px-5 mt-2 pb-4"
                style={{ borderBottomWidth: 1, borderColor: COLORS.line }}
              >
                <PostActions
                  liked={liked}
                  saved={saved}
                  likes={likesCount}
                  comments={commentCount}
                  saves={savesCount}
                  onLike={toggleLike}
                  onComment={openComments}
                  onSave={toggleSave}
                />
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
                    <Tag key={index} label={category.name} />
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
                        source={{ uri: like.profiles?.avatar_url || undefined }}
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
                <Text
                  style={{ color: COLORS.ink }}
                  className="text-xs font-black uppercase tracking-wider mb-3"
                >
                  Comments ({commentCount})
                </Text>

                {/* Inline comment box — type and send without opening a sheet */}
                <View
                  className="flex-row items-center mb-4"
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.line,
                    borderRadius: 24,
                    paddingLeft: 16,
                    paddingRight: 8,
                    paddingVertical: 6,
                  }}
                >
                  <TextInput
                    className="flex-1 text-sm"
                    style={{ color: COLORS.ink, paddingVertical: 4 }}
                    placeholder="Add a comment..."
                    placeholderTextColor={COLORS.muted}
                    value={commentText}
                    onChangeText={setCommentText}
                    onSubmitEditing={submitComment}
                    returnKeyType="send"
                    multiline
                  />
                  <TouchableOpacity
                    onPress={submitComment}
                    disabled={!commentText.trim()}
                    activeOpacity={0.7}
                    className="px-2 py-1"
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: commentText.trim() ? COLORS.accent : COLORS.muted,
                      }}
                    >
                      Send
                    </Text>
                  </TouchableOpacity>
                </View>

                {commentsArray.length === 0 ? (
                  <View className="py-6 items-center">
                    <Text
                      style={{ color: COLORS.muted }}
                      className="text-xs font-medium"
                    >
                      No comments yet. Be the first!
                    </Text>
                  </View>
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
                        <Avatar
                          avatarUrl={comment.profiles?.avatar_url ?? null}
                          displayName={comment.profiles?.username || "user"}
                          size="xs"
                          shadow={false}
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

          {/* Fixed header — stays on top and pressable no matter how far you scroll */}
          <PostHeaderOverlay
            avatarUrl={postData.profiles?.avatar_url ?? null}
            username={postData.profiles?.username ?? null}
            locationName={postData.location_name ?? null}
            onClose={onClose}
            onPressProfile={authorId ? goToAuthorProfile : undefined}
            onPressLocation={hasCoords ? goToLocation : undefined}
            onEdit={isOwner ? goToEdit : undefined}
            onDelete={isOwner ? confirmDelete : undefined}
          />

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