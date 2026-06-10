import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { PostCard } from "@/components/post";
import { Screen } from "@/components/styles/Screen";
import { CommentSheet } from "@/components/comments/CommentSheet";

import { DUMMY_COMMENTS } from "@/data/comments";
import { DUMMY_POSTS } from "@/data/posts";

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

  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const sheetRef = useRef<BottomSheetModal>(null);

  const [selectedComments, setSelectedComments] = useState([]);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleSave = (postId) => {
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Only show comments for selected posts
  const openComments = (postId: string) => {
    const filtered = DUMMY_COMMENTS.filter((c) => c.postId === postId);

    setSelectedComments(filtered);

    sheetRef.current?.present();
  };

  return (
    <Screen>
      <View className="flex-1">
        <FlatList
          data={DUMMY_POSTS}
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
        <CommentSheet ref={sheetRef} comments={selectedComments} />
      </View>
    </Screen>
  );
}
