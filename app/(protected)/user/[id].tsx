import { PostDetailModal } from "@/components/post/PostDetailModal";
import { UserProfile } from "@/components/profile/UserProfile";
import { ScrimIconButton } from "@/components/ui/ScrimIconButton";
import { ImageGridItem } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getSavedPostImages, getUserPostImages } from "@/lib/profile";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, View } from "react-native";

// Someone else's profile. Opens when you tap a name or avatar on a post.
// If the id is your own, it just shows your profile instead.
export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthContext();

  const isOwnProfile = !!profile?.id && profile.id === id;

  const [userPosts, setUserPosts] = useState<ImageGridItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<ImageGridItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingPosts(true);
        const [posts, saved] = await Promise.all([
          getUserPostImages(id),
          getSavedPostImages(id),
        ]);
        if (cancelled) return;
        setUserPosts(posts);
        setSavedPosts(saved);
      } catch (error: any) {
        console.error("Error loading profile content:", error.message);
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <Stack.Screen options={{ headerShown: false }} />

      <UserProfile
        userId={id}
        isOwnProfile={isOwnProfile}
        onEdit={() => router.push("/edit-profile")}
        postImages={userPosts}
        savedImages={savedPosts}
        isLoadingPosts={loadingPosts}
        onPostClick={(postId) => setSelectedPostId(postId)}
      />

      {/* Floating back button */}
      <ScrimIconButton
        icon="chevron-back"
        size={20}
        onPress={() => router.back()}
        className="absolute top-14 left-4 w-9 h-9"
      />

      <Modal
        visible={!!selectedPostId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPostId(null)}
      >
        {selectedPostId && (
          <PostDetailModal
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        )}
      </Modal>
    </View>
  );
}
