import { CommentSheet } from "@/components/comments/CommentSheet";
import { PostCard } from "@/components/post";
import { Screen } from "@/components/ui/Screen";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Image, FlatList, View, Text, Pressable } from "react-native";

import { getComments } from "@/lib/comments";
import { getPosts } from "@/lib/posts";
import { likePost, unlikePost, getUserLikedPostIds } from "@/lib/likes";
import { savePost, unsavePost, getUserSavedPostIds } from "@/lib/save";
import { useAuthContext } from "@/hooks/use-auth-context";
import { router } from "expo-router";

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

  // Fetch posts when screen loads
  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    async function fetchUserLikesAndSaves() {
      if (!profile?.id) return;

      try {
        const [likedIds, savedIds] = await Promise.all([
          getUserLikedPostIds(profile.id),
          getUserSavedPostIds(profile.id),
        ]);

        setLikedPosts(Object.fromEntries(likedIds.map((id) => [id, true])));
        setSavedPosts(Object.fromEntries(savedIds.map((id) => [id, true])));
      } catch (error) {
        console.log(error);
      }
    }
    fetchUserLikesAndSaves();
  }, [profile?.id]);

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

      // Revert action if db is unable to update
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
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

      setSavedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
    }
  };

  return (
    <Screen>
      <View className="flex-1">
<Pressable
  onPress={() => {
    console.log("Button tapped");
    router.push("/register-success");
  }}
  style={{ padding: 16, backgroundColor: "yellow" }}
>
  <Text>Go to success page</Text>
</Pressable>

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
