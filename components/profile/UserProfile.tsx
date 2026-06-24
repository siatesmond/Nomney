import { ImageGridItem } from "@/constants/types";
import { Profile, useAuthContext } from "@/hooks/use-auth-context";
import { followUser, unfollowUser } from "@/lib/followers";
import { getProfileWithStats, resolveAvatarUrl } from "@/lib/profile";
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
    let cancelled = false;
    (async () => {
      try {
        setLoadingProfile(true);
        const stats = await getProfileWithStats(userId, currentUser?.id);
        if (cancelled) return;

        setProfile(stats.profile);
        setFollowersCount(stats.followersCount);
        setFollowingCount(stats.followingCount);
        setIsFollowing(stats.isFollowing);
        setAvatarUrl(resolveAvatarUrl(stats.profile.avatar_url));
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (isOwnProfile || !currentUser?.id) return;

    const previouslyFollowing = isFollowing;
    const previousFollowersCount = followersCount;

    // Optimistic UI
    setIsFollowing(!previouslyFollowing);
    setFollowersCount((prev) => (previouslyFollowing ? prev - 1 : prev + 1));

    try {
      if (previouslyFollowing) {
        await unfollowUser(currentUser.id, userId);
      } else {
        await followUser(currentUser.id, userId);
      }
      onFollow?.();
    } catch (err) {
      console.error("Failed to mutate follow state:", err);
      // Revert on failure
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