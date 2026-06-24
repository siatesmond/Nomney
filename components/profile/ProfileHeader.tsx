import SignOutButton from "@/components/social-auth-buttons/sign-out-button";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "../UserAvatar";

type ProfileHeaderProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string | null;
  isOwnProfile: boolean;
  onEditPress: () => void;
  onFollowPress: () => void;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
};

export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  isOwnProfile,
  onEditPress,
  onFollowPress,
  isFollowing,
  followersCount,
  followingCount,
}: ProfileHeaderProps) {
  const showUnfollowStyle = !isOwnProfile && isFollowing;

  return (
    <View className="items-center pt-7 px-6 pb-5">
      <View className="mb-3.5">
        <Avatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          size="lg"
          shadow={true}
        />
      </View>

      <Text className="text-2xl font-bold text-[#1A1A1A] mb-0.5">
        {displayName}
      </Text>
      {username && (
        <Text className="text-[13px] text-[#999] mb-4">@{username}</Text>
      )}

      {/* Instagram-Style Stats Row */}
      <View className="flex-row justify-center gap-10 mb-5">
        <View className="items-center">
          <Text className="text-lg font-bold text-[#1A1A1A]">
            {followersCount}
          </Text>
          <Text className="text-xs text-[#666] mt-0.5">Followers</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-[#1A1A1A]">
            {followingCount}
          </Text>
          <Text className="text-xs text-[#666] mt-0.5">Following</Text>
        </View>
      </View>

      {/* Conditional Rendering based on isOwnProfile */}
      <TouchableOpacity
        className={`px-9 py-2.5 rounded-3xl ${showUnfollowStyle ? "bg-[#EEE]" : "bg-[#F4522A]"
          }`}
        style={{ elevation: showUnfollowStyle ? 0 : 4 }}
        activeOpacity={0.85}
        onPress={isOwnProfile ? onEditPress : onFollowPress}
      >
        <Text
          className={`text-sm font-semibold ${showUnfollowStyle ? "text-[#555]" : "text-white"
            }`}
        >
          {isOwnProfile ? "Edit Profile" : isFollowing ? "Unfollow" : "Follow"}
        </Text>
      </TouchableOpacity>

      {isOwnProfile && (
        <View className="mt-3 w-full items-center">
          <SignOutButton />
        </View>
      )}
    </View>
  );
}