import { useAuthContext } from "@/hooks/use-auth-context"; // 1. Import Auth Context
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageGrid } from "./ImageGrid";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

type GridPost = {
  id: string;
  imageUrl: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type UserProfileProps = {
  userId: string;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  postImages?: GridPost[];
  savedImages?: GridPost[];
  isLoadingPosts?: boolean;
  onPostClick?: (postId: string) => void;
};

const ACCENT = "#F4522A";

export function UserProfile({
  userId,
  isOwnProfile,
  onEdit = () => {},
  onFollow,
  postImages = [],
  savedImages = [],
  isLoadingPosts = false,
  onPostClick = () => {},
}: UserProfileProps) {
  const { profile: currentUser } = useAuthContext(); // Current logged-in user profile

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Posts" | "Saved">("Posts");

  // Follow Metrics States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);

        // 2. Setup parallel async queries for optimal load performance
        const profilePromise = supabase
          .from("profiles")
          .select("id, full_name, username, first_name, last_name, avatar_url")
          .eq("id", userId)
          .single();

        const followersCountPromise = supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);

        const followingCountPromise = supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId);

        // Check relationship matrix if viewing another profile
        const relationshipCheckPromise =
          !isOwnProfile && currentUser?.id
            ? supabase
                .from("followers")
                .select("*")
                .eq("follower_id", currentUser.id)
                .eq("following_id", userId)
                .maybeSingle()
            : Promise.resolve({ data: null });

        // Fire all queries simultaneously
        const [profileRes, followersRes, followingRes, relationshipRes] =
          await Promise.all([
            profilePromise,
            followersCountPromise,
            followingCountPromise,
            relationshipCheckPromise,
          ]);

        if (profileRes.error) throw profileRes.error;

        setProfile(profileRes.data);
        setFollowersCount(followersRes.count || 0);
        setFollowingCount(followingRes.count || 0);
        setIsFollowing(!!relationshipRes.data);

        if (profileRes.data?.avatar_url) {
          setAvatarUrl(
            profileRes.data.avatar_url.startsWith("http")
              ? profileRes.data.avatar_url
              : supabase.storage
                  .from("avatars")
                  .getPublicUrl(profileRes.data.avatar_url).data.publicUrl,
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [userId, isOwnProfile, currentUser?.id]);

  // 3. Handle Interactive Follow/Unfollow actions safely
  const handleFollowToggle = async () => {
    if (isOwnProfile || !currentUser?.id) return; // Prevent users from self-following

    const previouslyFollowing = isFollowing;
    const previousFollowersCount = followersCount;

    // Optimistic UI updates (instantly switches button and counts for user satisfaction)
    setIsFollowing(!previouslyFollowing);
    setFollowersCount((prev) => (previouslyFollowing ? prev - 1 : prev + 1));

    try {
      if (previouslyFollowing) {
        // Perform DB Unfollow action
        const { error: dbErr } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);

        if (dbErr) throw dbErr;
      } else {
        // Perform DB Follow action
        const { error: dbErr } = await supabase.from("followers").insert({
          follower_id: currentUser.id,
          following_id: userId,
        });

        if (dbErr) throw dbErr;
      }

      onFollow?.();
    } catch (err) {
      console.error("Failed to mutate follow state:", err);
      // Revert UI shifts if database operational failures occur
      setIsFollowing(previouslyFollowing);
      setFollowersCount(previousFollowersCount);
    }
  };

  if (loadingProfile || isLoadingPosts) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error || "Profile not found"}</Text>
      </SafeAreaView>
    );
  }

  const displayName =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Anonymous";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader
          avatarUrl={avatarUrl}
          displayName={displayName}
          username={profile.username}
          isOwnProfile={isOwnProfile}
          onEditPress={onEdit}
          onFollowPress={handleFollowToggle}
          isFollowing={isFollowing}
          followersCount={followersCount}
          followingCount={followingCount}
        />
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <ImageGrid
          posts={activeTab === "Posts" ? postImages : savedImages}
          onPostClick={onPostClick}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40, flexGrow: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  errorText: { color: "#999", fontSize: 14 },
});
