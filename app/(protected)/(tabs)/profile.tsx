import { PostDetailModal } from "@/components/post/PostDetailModal";
import { UserProfile } from "@/components/profile/UserProfile";
import { ImageGridItem } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getSavedPostImages, getUserPostImages } from "@/lib/profile";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();

  const [userPosts, setUserPosts] = useState<ImageGridItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<ImageGridItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingPosts(true);
        const [posts, saved] = await Promise.all([
          getUserPostImages(profile.id),
          getSavedPostImages(profile.id),
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
  }, [profile?.id]);

  if (!profile) return null;

  return (
    <>
      <UserProfile
        userId={profile.id}
        isOwnProfile={true}
        onEdit={() => router.push("/edit-profile")}
        postImages={userPosts}
        savedImages={savedPosts}
        isLoadingPosts={loadingPosts}
        onPostClick={(postId) => setSelectedPostId(postId)}
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
    </>
  );
}