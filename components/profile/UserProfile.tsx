// Shared profile layout, used for both your own profile and other people's.
// Loads the profile + follower stats and handles follow/unfollow.
import { ImageGridItem } from "@/constants/types";
import { COLORS } from "@/constants/theme";
import { Profile, useAuthContext } from "@/hooks/use-auth-context";
import { followUser, unfollowUser } from "@/lib/followers";
import { getProfileWithStats, resolveAvatarUrl } from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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

const ACCENT = COLORS.accent;

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
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Posts" | "Saved">("Posts");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const loadProfile = useCallback(
    async (signal: { cancelled: boolean }) => {
      try {
        const stats = await getProfileWithStats(userId, currentUser?.id);
        if (signal.cancelled) return;

        setProfile(stats.profile);
        setFollowersCount(stats.followersCount);
        setFollowingCount(stats.followingCount);
        setIsFollowing(stats.isFollowing);
        setAvatarUrl(resolveAvatarUrl(stats.profile.avatar_url));
      } catch (err: any) {
        if (!signal.cancelled) setError(err.message || "Failed to load profile");
      } finally {
        if (!signal.cancelled) setLoadingProfile(false);
      }
    },
    [userId, currentUser?.id],
  );

  // Re-fetch every time the screen comes into focus, so the avatar and the
  // follower/following counts stay correct after editing or following/unfollowing
  // (even when the change happened on a different screen).
  const hasLoaded = useRef(false);
  useFocusEffect(
    useCallback(() => {
      const signal = { cancelled: false };
      // Only show the full-screen spinner the first time, not on silent refreshes.
      if (!hasLoaded.current) setLoadingProfile(true);
      loadProfile(signal).finally(() => {
        hasLoaded.current = true;
      });
      return () => {
        signal.cancelled = true;
      };
    }, [loadProfile]),
  );

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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FDFCF9]">
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FDFCF9]">
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
      className="flex-1 bg-[#FDFCF9]"
      edges={["top", "left", "right"]}
    >
      {isOwnProfile && (
        <TouchableOpacity
          className="absolute right-4 z-10 p-1"
          style={{ top: insets.top + 8 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.ink} />
        </TouchableOpacity>
      )}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      >
        <ProfileHeader
          avatarUrl={avatarUrl}
          displayName={displayName}
          username={profile.username}
          bio={profile.bio}
          isOwnProfile={isOwnProfile}
          onEditPress={onEdit}
          onFollowPress={handleFollowToggle}
          onFollowersPress={() =>
            router.push({
              pathname: "/follows/[id]",
              params: { id: userId, tab: "followers" },
            })
          }
          onFollowingPress={() =>
            router.push({
              pathname: "/follows/[id]",
              params: { id: userId, tab: "following" },
            })
          }
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