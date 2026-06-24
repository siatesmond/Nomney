import { PostDetailModal } from "@/components/post/PostDetailModal";
import { UserProfile } from "@/components/profile/UserProfile";
import { GridPost } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Modal } from "react-native";

export default function ProfileScreen() {
  const { profile } = useAuthContext();

  const [userPosts, setUserPosts] = useState<GridPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<GridPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchAllProfileData();
    }
  }, [profile?.id]);

  const fetchAllProfileData = async () => {
    try {
      setLoadingPosts(true);
      // Fire both queries in parallel for efficiency
      await Promise.all([fetchUserPosts(), fetchSavedPosts()]);
    } catch (error: any) {
      console.error("Error loading profile content:", error.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchUserPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
          id,
          created_at,
          post_image (
              image_url,
              display_order
          )
      `,
      )
      .eq("user_id", profile!.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data) {
      const extractedPosts: GridPost[] = data
        .map((post) => {
          const sortedImages = (post.post_image || []).sort(
            (a: any, b: any) => a.display_order - b.display_order,
          );
          return {
            id: post.id,
            imageUrl: sortedImages[0]?.image_url,
          };
        })
        .filter((post) => !!post.imageUrl);

      setUserPosts(extractedPosts);
    }
  };

  const fetchSavedPosts = async () => {
    const { data, error } = await supabase
      .from("saves")
      .select(
        `
        post_id,
        posts (
          id,
          post_image (
            image_url,
            display_order
          )
        )
      `,
      )
      .eq("user_id", profile!.id);

    if (error) throw error;

    if (data) {
      const extractedSaved: GridPost[] = data
        .map((item: any) => {
          const post = item.posts;
          if (!post) return null;

          const sortedImages = (post.post_image || []).sort(
            (a: any, b: any) => a.display_order - b.display_order,
          );
          return {
            id: post.id,
            imageUrl: sortedImages[0]?.image_url,
          };
        })
        .filter((post): post is GridPost => !!post);

      setSavedPosts(extractedSaved);
    }
  };

  if (!profile) return null;

  return (
    <>
      <UserProfile
        userId={profile.id}
        isOwnProfile={true}
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
