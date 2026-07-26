import { CommentSheet } from "@/components/comments/CommentSheet";
import { PostCard } from "@/components/post";
import { Screen } from "@/components/ui/Screen";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/constants/theme";
import { Comment, Post } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getComments } from "@/lib/comments";
import { getUserLikedPostIds, likePost, unlikePost } from "@/lib/likes";
import { getFeedPosts } from "@/lib/posts";
import { getUserSavedPostIds, savePost, unsavePost } from "@/lib/save";

const HomeHeader = () => (
  <View className="flex-row items-center justify-between px-4 pt-10 pb-4">
    <View className="flex-row items-center gap-2">
      <Image
        source={require("@/assets/images/icon/mascotWithLogo.png")}
        className="w-20 h-20"
        resizeMode="contain"
      />
      <Text className="text-3xl font-bold text-gray-900">Nomney</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});

  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedComments, setSelectedComments] = useState<Comment[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { profile } = useAuthContext();

  // Feed = your own posts + posts from people you follow, newest first.
  const loadFeed = useCallback(async () => {
    if (!profile?.id) return;
    setError(null);
    try {
      const data = await getFeedPosts(profile.id);
      setPosts(data);
    } catch (err) {
      console.log(err);
      setError("Couldn't load your feed.");
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    loadFeed().finally(() => setLoading(false));
  }, [profile?.id, loadFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  // Refresh which posts you've liked/saved every time Home is focused, so the
  // icons stay in sync with the DB (e.g. after saving/unsaving on another screen).
  useFocusEffect(
    useCallback(() => {
      if (!profile?.id) return;
      let cancelled = false;
      (async () => {
        try {
          const [likedIds, savedIds] = await Promise.all([
            getUserLikedPostIds(profile.id),
            getUserSavedPostIds(profile.id),
          ]);
          if (cancelled) return;
          setLikedPosts(Object.fromEntries(likedIds.map((id) => [id, true])));
          setSavedPosts(Object.fromEntries(savedIds.map((id) => [id, true])));
        } catch (err) {
          console.log(err);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile?.id]),
  );

  // Fetch comments, then open the comment sheet.
  const openComments = async (postId: string) => {
    try {
      setSelectedPostId(postId);
      const comments = await getComments(postId);
      setSelectedComments(comments);
      sheetRef.current?.present();
    } catch (err) {
      console.log(err);
    }
  };

  // Like/Unlike a post (optimistic, rolls back on failure).
  const toggleLike = async (postId: string) => {
    if (!profile?.id) return;
    const isLiked = !!likedPosts[postId];

    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    );

    try {
      if (isLiked) await unlikePost(postId, profile.id);
      else await likePost(postId, profile.id);
    } catch (err) {
      console.log(err);
      // Revert both the icon and the count if the db update failed.
      setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1 }
            : post,
        ),
      );
    }
  };

  // Save/Unsave a post (optimistic, rolls back on failure).
  const toggleSave = async (postId: string) => {
    if (!profile?.id) return;
    const isSaved = !!savedPosts[postId];

    setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, saves: isSaved ? post.saves - 1 : post.saves + 1 }
          : post,
      ),
    );

    try {
      if (isSaved) await unsavePost(postId, profile.id);
      else await savePost(postId, profile.id);
    } catch (err) {
      console.log(err);
      setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, saves: isSaved ? post.saves + 1 : post.saves - 1 }
            : post,
        ),
      );
    }
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="items-center py-20">
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      );
    }
    if (error) {
      return (
        <View className="items-center py-20 px-8">
          <Text className="text-sm text-center mb-3" style={{ color: COLORS.muted }}>
            {error}
          </Text>
          <TouchableOpacity
            className="px-5 py-2.5 rounded-full bg-accent"
            onPress={() => {
              setLoading(true);
              loadFeed().finally(() => setLoading(false));
            }}
          >
            <Text className="text-white font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View className="items-center py-20 px-8">
        <Text className="text-base font-semibold text-center mb-1" style={{ color: COLORS.ink }}>
          Your feed is empty
        </Text>
        <Text className="text-sm text-center" style={{ color: COLORS.muted }}>
          You haven&apos;t followed anyone yet. Open a post in Explore, tap the
          author to visit their profile, then hit Follow.
        </Text>
      </View>
    );
  };

  return (
    <Screen>
      <View className="flex-1">
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<HomeHeader />}
          ListEmptyComponent={renderEmpty()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item: post }) => (
            <View className="px-3 pb-4">
              {/* Shadow lives on this outer view — the PostCard itself uses
                  overflow-hidden to round its corners, which would clip a
                  shadow on iOS if it were on the same view. */}
              <View
                className="bg-white rounded-xl"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 3,
                }}
              >
                <PostCard
                  {...post}
                  liked={!!likedPosts[post.id]}
                  saved={!!savedPosts[post.id]}
                  onLike={() => toggleLike(post.id)}
                  onComment={() => openComments(post.id)}
                  onSave={() => toggleSave(post.id)}
                />
              </View>
            </View>
          )}
        />

        {/* Comment Bottom Sheet */}
        <CommentSheet
          ref={sheetRef}
          postId={selectedPostId}
          comments={selectedComments}
          onNewCommentAdded={(newComment) => {
            setSelectedComments((prev) => [...prev, newComment]);
            setPosts((prev) =>
              prev.map((post) =>
                post.id === selectedPostId
                  ? { ...post, comments: post.comments + 1 }
                  : post,
              ),
            );
          }}
        />
      </View>
    </Screen>
  );
}
