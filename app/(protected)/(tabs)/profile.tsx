import { UserProfile } from "@/components/profile/UserProfile";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
  const { profile } = useAuthContext();
  const [userPosts, setUserPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchUserPosts();
    }
  }, [profile?.id]);

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
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
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const extractedImages = data
          .map((post) => {
            const sortedImages = (post.post_image || []).sort(
              (a: any, b: any) => a.display_order - b.display_order,
            );
            return sortedImages[0]?.image_url;
          })
          .filter((url): url is string => !!url);

        setUserPosts(extractedImages);
      }
    } catch (error: any) {
      console.error("Error fetching profile media feed:", error.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  if (!profile) return null;

  return (
    <UserProfile
      userId={profile.id}
      isOwnProfile={true}
      postImages={userPosts}
      savedImages={savedPosts}
      isLoadingPosts={loadingPosts}
    />
  );
}
