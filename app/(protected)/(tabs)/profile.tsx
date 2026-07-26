import { PostDetailModal } from "@/components/post/PostDetailModal";
import { UserProfile } from "@/components/profile/UserProfile";
import { ImageGridItem } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getSavedPostImages, getUserPostImages } from "@/lib/profile";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Modal } from "react-native";

// import { StreakWidgetSmall } from "@/widget/StreakWidgetSmall";
// import { StreakWidgetLarge } from "@/widget/StreakWidgetLarge";
// import { WidgetPreview } from 'react-native-android-widget';

// Your own profile tab. Loads your posts + saved posts and shows them.
export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();

  const [userPosts, setUserPosts] = useState<ImageGridItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<ImageGridItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const loadContent = useCallback(
    async (signal: { cancelled: boolean }) => {
      if (!profile?.id) return;
      try {
        const [posts, saved] = await Promise.all([
          getUserPostImages(profile.id),
          getSavedPostImages(profile.id),
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
    [profile?.id],
  );

  const hasLoaded = useRef(false);
  useFocusEffect(
    useCallback(() => {
      const signal = { cancelled: false };
      if (!hasLoaded.current) setLoadingPosts(true);
      loadContent(signal).finally(() => {
        hasLoaded.current = true;
      });
      return () => {
        signal.cancelled = true;
      };
    }, [loadContent]),
  );

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

      {/* Preview widget */}
      {/* <WidgetPreview
        renderWidget={() => <StreakWidgetSmall streakCount={5} />}
        width={320}
        height={200}
      />

      <WidgetPreview
        renderWidget={() => <StreakWidgetLarge streakCount={5} longestStreak={10}/>}
        width={320}
        height={200}
      /> */}

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
              // Refresh so the Saved tab reflects any save/unsave done inside
              // the modal (closing it isn't a screen-focus event, so the grid
              // wouldn't otherwise update).
              loadContent({ cancelled: false });
            }}
            onDeleted={() => loadContent({ cancelled: false })}
          />
        )}
      </Modal>
    </>
  );
}