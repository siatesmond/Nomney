import { PostDetailModal } from "@/components/post/PostDetailModal";
import { UserProfile } from "@/components/profile/UserProfile";
import { ScrimIconButton } from "@/components/ui/ScrimIconButton";
import { ImageGridItem } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getSavedPostImages, getUserPostImages } from "@/lib/profile";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

  const loadContent = useCallback(
    async (signal: { cancelled: boolean }) => {
      if (!id) return;
      try {
        const [posts, saved] = await Promise.all([
          getUserPostImages(id),
          getSavedPostImages(id),
        ]);
        if (signal.cancelled) return;
        setUserPosts(posts);
        setSavedPosts(saved);
      } catch (error: any) {
        console.error("Error loading profile content:", error.message);
      } finally {
        if (!signal.cancelled) setLoadingPosts(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (!id) return;
    const signal = { cancelled: false };
    setLoadingPosts(true);
    loadContent(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [id, loadContent]);

  if (!id) return null;

  return (
    <View className="flex-1 bg-[#FDFCF9]">
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
            onClose={() => {
              setSelectedPostId(null);
              loadContent({ cancelled: false });
            }}
            onDeleted={() => loadContent({ cancelled: false })}
          />
        )}
      </Modal>
    </View>
  );
}
