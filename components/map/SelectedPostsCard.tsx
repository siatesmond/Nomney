import { COLORS } from "@/constants/theme";
import { PostLocation } from "@/lib/posts";
import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { PostInfo } from "./PostInfo";

const CARD_SHADOW = {
  elevation: 8,
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
} as const;

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View className="flex-row justify-center mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 16 : 6,
            height: 6,
            borderRadius: 3,
            marginHorizontal: 3,
            backgroundColor: i === active ? COLORS.accent : COLORS.line,
          }}
        />
      ))}
    </View>
  );
}

// The bottom card for a tapped pin. One post then a card with a swipeable photo
// gallery. Several posts at the same spot then a swipeable carousel of cards.
export function SelectedPostsCard({
  posts,
  showUser,
  onOpenPost,
  onOpenMaps,
}: {
  posts: PostLocation[];
  showUser: boolean;
  onOpenPost: (post: PostLocation) => void;
  onOpenMaps: (post: PostLocation) => void;
}) {
  const [mediaW, setMediaW] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [cardPageW, setCardPageW] = useState(0);
  const [postIndex, setPostIndex] = useState(0);

  if (posts.length === 0) return null;

  // One post then a single card with its photo gallery.
  if (posts.length === 1) {
    const post = posts[0];
    return (
      <View
        className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl p-4"
        style={CARD_SHADOW}
      >
        {post.imageUrls.length > 0 && (
          <View
            onLayout={(e) => setMediaW(e.nativeEvent.layout.width)}
            style={{ marginBottom: 10 }}
          >
            {mediaW > 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) =>
                  setPhotoIndex(
                    Math.round(e.nativeEvent.contentOffset.x / mediaW),
                  )
                }
                style={{ borderRadius: 12, backgroundColor: "#fff" }}
              >
                {post.imageUrls.map((url, i) => (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={{ width: mediaW, height: 240 }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                ))}
              </ScrollView>
            )}
            {post.imageUrls.length > 1 && (
              <Dots count={post.imageUrls.length} active={photoIndex} />
            )}
          </View>
        )}
        <PostInfo
          post={post}
          showUser={showUser}
          onView={() => onOpenPost(post)}
          onMaps={() => onOpenMaps(post)}
        />
      </View>
    );
  }

  // Several posts at the same spot then swipe card by card.
  return (
    <View className="absolute bottom-6 left-0 right-0">
      <Text
        className="text-xs font-semibold mb-2 px-5"
        style={{ color: COLORS.muted }}
      >
        {posts.length} posts here · swipe →
      </Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => setCardPageW(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={(e) =>
          cardPageW &&
          setPostIndex(Math.round(e.nativeEvent.contentOffset.x / cardPageW))
        }
      >
        {posts.map((p) => (
          <View key={p.id} style={{ width: cardPageW }}>
            <View className="mx-4 bg-white rounded-2xl p-4" style={CARD_SHADOW}>
              <Image
                source={{ uri: p.imageUrl }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  marginBottom: 10,
                  backgroundColor: "#fff",
                }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <PostInfo
                post={p}
                showUser={showUser}
                onView={() => onOpenPost(p)}
                onMaps={() => onOpenMaps(p)}
              />
            </View>
          </View>
        ))}
      </ScrollView>
      <Dots count={posts.length} active={postIndex} />
    </View>
  );
}
