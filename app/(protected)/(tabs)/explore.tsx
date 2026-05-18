import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { PostCard } from "@/components/post";
import { Screen } from "@/components/styles/Screen";

const CATEGORIES = ["japanese", "mexican", "cafe", "homemade"];

const EXPLORE_POSTS = [
  {
    id: "post1",
    userId: "user123",
    username: "user123",
    timeAgo: "2 hours ago",
    title: "French toast with berries 🥧 It's worth a try!",
    description:
      "Crispy outside, custard inside. The berries were fresh this morning!",
    imageUrl: "",
    tags: ["english", "cafe", "dessert"],
    likes: 42,
    comments: 8,
    saves: 15,
    location: "Morning Brew Cafe",
    distance: "450m",
  },
  {
    id: "post2",
    userId: "user123",
    username: "user123",
    timeAgo: "2 hours ago",
    title: "French toast with berries 🥧 It's worth a try!",
    description:
      "Crispy outside, custard inside. The berries were fresh this morning!",
    imageUrl: "",
    tags: ["english", "cafe", "dessert"],
    likes: 42,
    comments: 8,
    saves: 15,
    location: "Morning Brew Cafe",
    distance: "450m",
  },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

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

  return (
    <Screen>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          
          {/* Header */}
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
                    selectedCategory === category
                      ? "bg-[#FA5A40]"
                      : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === category
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Posts */}
          <View className="px-4 pb-6 gap-4">
            {EXPLORE_POSTS.map((post) => (
              <View
                key={post.id}
                className="bg-white rounded-lg overflow-hidden"
              >
                <PostCard
                  {...post}
                  liked={!!likedPosts[post.id]}
                  saved={!!savedPosts[post.id]}
                  onLike={() => toggleLike(post.id)}
                  onComment={() => console.log("Commented")}
                  onSave={() => toggleSave(post.id)}
                />
              </View>
            ))}
          </View>

        </ScrollView>
      </View>
    </Screen>
  );
}