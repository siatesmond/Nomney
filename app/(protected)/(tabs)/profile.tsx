import { PostDetailModal } from "@/components/post/PostDetailModal";
import { UserProfile } from "@/components/profile/UserProfile";
import { ImageGridItem } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getSavedPostImages, getUserPostImages } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Modal, Text, View } from "react-native";

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
  const [debug, setDebug] = useState("checking…"); // TEMP diagnostic

  const loadContent = useCallback(
    async (signal: { cancelled: boolean }) => {
      if (!profile?.id) return;

      // TEMP DIAGNOSTIC: raw look at this user's posts + their images.
      try {
        const { data: raw, error: rawErr } = await supabase
          .from("posts")
          .select("id, post_image ( image_url )")
          .eq("user_id", profile.id);
        const total = raw?.length ?? 0;
        const withImg =
          raw?.filter((p: any) => (p.post_image?.length ?? 0) > 0).length ?? 0;
        setDebug(
          rawErr
            ? `QUERY ERROR: ${rawErr.message}`
            : `posts=${total}  withImage=${withImg}  uid=${profile.id.slice(0, 8)}`,
        );
      } catch (e: any) {
        setDebug(`THROWN: ${e?.message ?? e}`);
      }

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
        setDebug((d) => `${d} | getUserPostImages ERR: ${error.message}`);
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
      {/* TEMP DIAGNOSTIC banner — remove once the missing-posts issue is solved. */}
      <View
        style={{
          position: "absolute",
          top: 44,
          left: 8,
          right: 8,
          zIndex: 999,
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: 6,
          borderRadius: 6,
        }}
        pointerEvents="none"
      >
        <Text style={{ color: "#fff", fontSize: 11 }}>
          {debug} | grid={userPosts.length}/{savedPosts.length} loading=
          {String(loadingPosts)}
        </Text>
      </View>

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
            onClose={() => setSelectedPostId(null)}
          />
        )}
      </Modal>
    </>
  );
}