import { PostDetailModal } from "@/components/post/PostDetailModal";
import { ImageGrid } from "@/components/profile/ImageGrid";
import { Screen } from "@/components/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Category, Post } from "@/constants/types";
import { getCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";

import Fuse from "fuse.js";

type ListHeaderProps = {
  searchText: string;
  setSearchText: (text: string) => void;
  allCategories: Category[];
  selectedCategories: string[];
  toggleCategory: (name: string) => void;
};

const ListHeader = ({
  searchText,
  setSearchText,
  allCategories,
  selectedCategories,
  toggleCategory,
}: ListHeaderProps) => (
  <View className="px-4 pt-10 pb-4">
    <View className="flex-row items-center justify-between">
      <View className="w-2/3">
        <Text className="text-3xl font-bold text-gray-900">
          What tempts you today?
        </Text>
      </View>

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
      contentContainerStyle={{ gap: 8, paddingRight: 16 }}
    >
      {allCategories.map((category) => {
        const selected = selectedCategories.includes(category.name);
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => toggleCategory(category.name)}
            className={`px-4 py-2 rounded-full ${selected ? "bg-accent" : "bg-white"}`}
          >
            <Text
              className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-600"}`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

export default function ExploreScreen() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // The post whose detail modal is open.
  const [activePost, setActivePost] = useState<Post | null>(null);

  // Fetch categories once.
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories(10);
        setAllCategories(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const loadPosts = useCallback(async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    loadPosts().finally(() => setLoading(false));
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  // Fuzzy search index, rebuilt when the post list changes.
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 2 },
          { name: "caption", weight: 1 },
          { name: "categories", weight: 2 },
          { name: "location", weight: 2 },
          { name: "username", weight: 1.5 },
        ],
        threshold: 0.3, // lower -> tighter matching
        includeScore: true,
      }),
    [posts],
  );

  const searchedPosts = useMemo(() => {
    const query = searchText.trim();
    if (!query) return posts;
    return fuse.search(query).map((result) => result.item);
  }, [fuse, searchText, posts]);

  // Category chips narrow the search results further.
  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return searchedPosts;
    return searchedPosts.filter((post) =>
      selectedCategories.some((selected) => post.categories.includes(selected)),
    );
  }, [searchedPosts, selectedCategories]);

  // One thumbnail per post (its first image).
  const gridItems = useMemo(
    () =>
      filteredPosts
        .filter((post) => post.imageUrls?.[0])
        .map((post) => ({ id: post.id, imageUrl: post.imageUrls[0] })),
    [filteredPosts],
  );

  const handleClickedGridItem = (postId: string) => {
    const post = filteredPosts.find((p) => p.id === postId);
    if (post) setActivePost(post);
  };

  const emptyText = searchText.trim()
    ? `No results for "${searchText.trim()}"`
    : "No posts yet";

  return (
    <Screen noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ListHeader
          searchText={searchText}
          setSearchText={setSearchText}
          allCategories={allCategories}
          toggleCategory={toggleCategory}
          selectedCategories={selectedCategories}
        />
        <ImageGrid
          items={gridItems}
          onPressItem={handleClickedGridItem}
          loading={loading}
          emptyText={emptyText}
        />
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
    </Screen>
  );
}
