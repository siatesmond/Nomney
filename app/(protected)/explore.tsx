import { CommentSheet } from "@/components/comments/CommentSheet";
import { PostCard } from "@/components/post";
import { Screen } from "@/components/styles/Screen";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getComments } from "@/lib/comments";
import { getPosts } from "@/lib/posts";
import { likePost, unlikePost } from "@/lib/likes";
import { savePost, unsavePost } from "@/lib/save";
import { useAuthContext } from "@/hooks/use-auth-context";

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

/* temp dummy data objects */
const CATEGORIES = ["japanese", "mexican", "cafe", "homemade"];

const ListHeader = ({
  searchText,
  setSearchText,
  selectedCategory,
  setSelectedCategory,
}) => (
  // Page Header
  <View className="px-2 pt-10 pb-4">
    <View className="flex-row items-center justify-between">
      {/* Text */}
      <View className="w-2/3">
        <Text className="text-3xl font-bold text-gray-900">
          What tempts you today?
        </Text>
      </View>

      {/* Illustration */}
      <View className="w-1/3 items-end">
        <Image
          source={require("@/assets/images/icon/mascotWithLogo.png")}
          className="w-full h-24"
          resizeMode="contain"
        />
      </View>
    </View>

    {/* Search bar */}
    <View className="flex-row items-center bg-[#e8e5e2] rounded-full px-4 py-3 mb-4">
      <Ionicons name="search-outline" size={18} color="#999" />
      <TextInput
        placeholder="Search dishes, restaurants..."
        className="flex-1 ml-2 text-[#838383] font-semibold"
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#999"
      />
    </View>

    {/* Categories */}
    <View className="flex-row gap-2 flex-wrap">
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === category ? "bg-[#FA5A40]" : "bg-white"
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              selectedCategory === category ? "text-white" : "text-gray-600"
            }`}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>

  //End of Page header
);

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const sheetRef = useRef<BottomSheetModal>(null);

  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState([]);

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

      // Revert action if db is unable to update
      setSavedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
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
          ListHeaderComponent={
            <ListHeader
              searchText={searchText}
              setSearchText={setSearchText}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          }
          renderItem={({ item: post }) => (
            <View className="pb-6">
              <View className="bg-white rounded-lg overflow-hidden">
                <PostCard
                  {...post}
                  liked={!!likedPosts[post.id]}
                  saved={!!savedPosts[post.id]}
                  onLike={() => toggleLike(post.id)}
                  onComment={() => openComments(post.id)} // opens Bottom Sheet on click
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
          onNewCommentAdded={(newComment) =>
            setSelectedComments((prev) => [...prev, newComment])
          } // append new comment with existing comments
        />
      </View>
    </Screen>
  );
}
