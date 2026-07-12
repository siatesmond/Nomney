import { CommentSheet } from "@/components/comments/CommentSheet";
import { PostDetailModal } from "@/components/post/PostDetailModal";
import { ImageGrid } from "@/components/profile/ImageGrid";
import { Screen } from "@/components/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthContext } from "@/hooks/use-auth-context";
import { getPosts } from "@/lib/posts";
import { getComments } from "@/lib/comments";
import { getCategories } from "@/lib/categories";
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

const ListHeader = ({
  searchText,
  setSearchText,
  allCategories,
  selectedCategories,
  toggleCategory,

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
      
      {allCategories.map((category) => {
        const selected = selectedCategories.includes(category.name);
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => toggleCategory(category.name)}
            className={`px-4 py-2 rounded-full ${selected ? "bg-accent" : "bg-white"
              }`}
          >
            <Text
              className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-600"
                }`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>

  //End of Page header
);

export default function ExploreScreen() {
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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


  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories(10);
        setAllCategories(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCategories();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName) // unselect
        : [...prev, categoryName], // select
    );
  };


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

  // Search Filter
  const searchedPosts = useMemo(() => {
    const query = searchText.trim();

    console.log(query);

    if (!query) return posts;
    return fuse.search(query).map((results) => results.item);
  }, [fuse, searchText, posts])

  // Category Filter buttons (narrows down search results)
  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return searchedPosts;
    return searchedPosts.filter((post) =>
      selectedCategories.some((selected) => post.categories.includes(selected)),
    );
  }, [searchedPosts, selectedCategories]);

  // Fetch user's liked and saved posts 
  // ensures accurate update on load (icons state)
  useEffect(() => {
    async function fetchUserLikesAndSaves() {
      if (!profile || !profile.id) return; // for if auth is still loading

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
          allCategories={allCategories}
          toggleCategory={toggleCategory}
          selectedCategories={selectedCategories}

        />
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#FA5A40" />
          </View>
        ) : (
          <ImageGrid items={gridItems} onPressItem={handleClickedGridItem} />
        )}
      </ScrollView>

      {/* Full post detail view */}
      <Modal
        visible={!!activePost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActivePost(null)}
      >
        {activePost && (
          <PostDetailModal
            postId={activePost.id}
            onClose={() => setActivePost(null)}
          />
        )}
      </Modal>

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
