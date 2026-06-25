import { CommentSheet } from "@/components/comments/CommentSheet";
import { PostCard } from "@/components/post";
import { ImageGrid } from "@/components/profile/ImageGrid";
import { Screen } from "@/components/styles/Screen";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthContext } from "@/hooks/use-auth-context";
import { getPosts } from "@/lib/posts";
import { getComments } from "@/lib/comments";
import { likePost, unlikePost, getUserLikedPostIds } from "@/lib/likes";
import { savePost, unsavePost, getUserSavedPostIds } from "@/lib/save";

import Fuse from "fuse.js";

type Post = {
  id: string;
  title: string;
  caption: string;
  imageUrls: string[];
  categories: string[];
  location: string;
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
  <View className="px-4 pt-10 pb-4">
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
          className={`px-4 py-2 rounded-full ${selectedCategory === category ? "bg-[#FA5A40]" : "bg-white"
            }`}
        >
          <Text
            className={`text-sm font-semibold ${selectedCategory === category ? "text-white" : "text-gray-600"
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

  // Store post in grid that is clicked on
  const [activePost, setActivePost] = useState<Post | null>(null);

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

  // Fuse Search
  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'caption', weight: 1 },
        { name: 'categories', weight: 2 },
        { name: 'location', weight: 2 },
        { name: 'username', weight: 1.5 },
      ],
      threshold: 0.3, // lower -> tighter matching
      includeScore: true,
      useTokenSearch: true, // for multi-word search

    })
  }, [posts])

  // Filter posts based on search text 
  const filteredPosts = useMemo(() => {
    const query = searchText.trim();

    console.log(query);

    if (!query) return posts;
    return fuse.search(query).map((results) => results.item);
  }, [fuse, searchText, posts])


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

      // Revert action if db is unable to update (icon state and count)
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) {
            return post;
          }
          const revertedLikes = isLiked ? post.likes + 1 : post.likes - 1;
          return { ...post, likes: revertedLikes };
        }),
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

      // Revert action if db is unable to update (icon state and count)
      setSavedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) {
            return post;
          }
          const revertedSaves = isSaved ? post.saves + 1 : post.saves - 1;
          return { ...post, saves: revertedSaves };
        }),
      );
    }
  };

  // Map post to Image Grid (first image per post)
  const gridItems = useMemo(
    () =>
      filteredPosts
        .filter((post) => post.imageUrls?.[0])
        .map((post) => ({ id: post.id, imageUrl: post.imageUrls[0] })),
    [filteredPosts],
  );

  const handleClickedGridItem = (postId: string) => {
    const post = filteredPosts.find((p) => p.id === postId);
    if (post) {
      setActivePost(post); // store clicked post in arr
    }
  };

  // Finds post by id in 'posts' on every render so latest counts are always reflected
  const activePostLatest = activePost
    ? (posts.find((p) => p.id === activePost.id) ?? activePost)
    : null;

  return (
    <Screen noPadding>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ListHeader
          searchText={searchText}
          setSearchText={setSearchText}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#FA5A40" />
          </View>
        ) : (
          <ImageGrid items={gridItems} onPressItem={handleClickedGridItem} />
        )}
      </ScrollView>

      {/* Full post view overlay above grids  */}
      {!!activePostLatest && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 bg-white"
          style={{ elevation: 10 }}
        >
          <Screen>
            <View className="flex-row justify-end px-4 pt-3">
              <TouchableOpacity
                onPress={() => setActivePost(null)}
                className="p-2"
              >
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              <PostCard
                {...activePostLatest}
                liked={!!likedPosts[activePostLatest.id]}
                saved={!!savedPosts[activePostLatest.id]}
                onLike={() => toggleLike(activePostLatest.id)}
                onComment={() => openComments(activePostLatest.id)}
                onSave={() => toggleSave(activePostLatest.id)}
              />
            </ScrollView>
          </Screen>
        </View>
      )}

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
    </Screen>
  );
}
