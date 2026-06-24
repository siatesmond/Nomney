import { ImageGridItem } from "@/constants/types";
import { Profile, useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageGrid } from "./ImageGrid";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

type UserProfileProps = {
  userId: string;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  postImages?: ImageGridItem[];
  savedImages?: ImageGridItem[];
  isLoadingPosts?: boolean;
  onPostClick?: (postId: string) => void;
};

const ACCENT = "#F4522A";

export function UserProfile({
  userId,
  isOwnProfile,
  onEdit = () => { },
  onFollow,
  postImages = [],
  savedImages = [],
  isLoadingPosts = false,
  onPostClick = () => { },
}: UserProfileProps) {
  const { profile: currentUser } = useAuthContext();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Posts" | "Saved">("Posts");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);

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

        setProfile(profileRes.data as Profile | null);
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

  const handleFollowToggle = async () => {
    if (isOwnProfile || !currentUser?.id) return;

    const previouslyFollowing = isFollowing;
    const previousFollowersCount = followersCount;

    setIsFollowing(!previouslyFollowing);
    setFollowersCount((prev) => (previouslyFollowing ? prev - 1 : prev + 1));

    try {
      if (previouslyFollowing) {
        const { error: dbErr } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);

        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await supabase.from("followers").insert({
          follower_id: currentUser.id,
          following_id: userId,
        });

        if (dbErr) throw dbErr;
      }

      onFollow?.();
    } catch (err) {
      console.error("Failed to mutate follow state:", err);
      setIsFollowing(previouslyFollowing);
      setFollowersCount(previousFollowersCount);
    }
  };

  if (loadingProfile || isLoadingPosts) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F9F9F9]">
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F9F9F9]">
        <Text className="text-[#999] text-sm">
          {error || "Profile not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const displayName =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Anonymous";

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9F9F9]"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
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
          items={activeTab === "Posts" ? postImages : savedImages}
          onPressItem={onPostClick}
        />
      </ScrollView>
    </SafeAreaView>
  );
}