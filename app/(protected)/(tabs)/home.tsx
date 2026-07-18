import { CommentSheet } from "@/components/comments/CommentSheet";
import { PostCard } from "@/components/post";
import { Screen } from "@/components/ui/Screen";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

import { useAuthContext } from "@/hooks/use-auth-context";
import { getComments } from "@/lib/comments";
import { getUserLikedPostIds, likePost, unlikePost } from "@/lib/likes";
import { getFeedPosts } from "@/lib/posts";
import { getUserSavedPostIds, savePost, unsavePost } from "@/lib/save";

type Post = {
  id: string;
  title: string;
  caption: string;
  imageUrls: string[];
  categories: string[];
  likes: number;
  comments: number;
  saves: number;
  username: string;
  avatarUrl: string | null;
  timeAgo: string;
};

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

  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const sheetRef = useRef<BottomSheetModal>(null);

  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { profile } = useAuthContext();

  // Feed = your own posts + posts from people you follow, newest first.
  useEffect(() => {
    const uid = profile?.id;
    if (!uid) return;
    (async () => {
      try {
        const data = await getFeedPosts(uid);
        setPosts(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.id]);

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
        } catch (error) {
          console.log(error);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile?.id]),
  );

  // Fetch comments when user clicks on comments
  const openComments = async (postId: string) => {
    try {
      setSelectedPostId(postId);

      // Fetch comments and set state before opening comments sheet
      const comments = await getComments(postId);
      setSelectedComments(comments);

      sheetRef.current?.present();
    } catch (error) {
      console.log(error);
    }
  };

  // Like/Unlike post
  const toggleLike = async (postId: string) => {
    // To check if post is currently liked
    const isLiked = !!likedPosts[postId];

    //toggle liked/unlike state
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // Update like count
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }
        const updatedLikes = isLiked ? post.likes - 1 : post.likes + 1;
        return { ...post, likes: updatedLikes };
      }),
    );
    // Update db
    try {
      if (isLiked) {
        await unlikePost(postId, profile.id);
        console.log("Unliked post:", postId);
      } else {
        await likePost(postId, profile.id);
        console.log("Liked post:", postId);
      }
    } catch (error) {
      console.log(error);
      console.log("Failed to update liked count");

      // Revert both the icon and the count if the db update failed.
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1 }
            : post,
        ),
      );
    }
  };

  // Save/Unsave post
  const toggleSave = async (postId: string) => {
    const isSaved = !!savedPosts[postId];

    //toggle saved/unsaved state
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // Update saved count
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }
        const updatedSaves = isSaved ? post.saves - 1 : post.saves + 1;
        return { ...post, saves: updatedSaves };
      }),
    );

    // Update db
    try {
      if (isSaved) {
        await unsavePost(postId, profile.id);
        console.log("Unsaved post:", postId);
      } else {
        await savePost(postId, profile.id);
        console.log("Saved post:", postId);
      }
    } catch (error) {
      console.log(error);
      console.log("Failed to update saved count");

      // Revert both the icon and the count if the db update failed.
      setSavedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, saves: isSaved ? post.saves + 1 : post.saves - 1 }
            : post,
        ),
      );
    }
  };

  return (
    <Screen>
      <View className="flex-1">
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<HomeHeader />}
          renderItem={({ item: post }) => (
            <View className="pb-6">
              <View className="bg-white rounded-lg overflow-hidden">
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
            // append new comment with existing comments
            setSelectedComments((prev) => [...prev, newComment]);

            // Increment comment count on the post
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
