// Top of a profile: avatar, name, bio, follower counts, and the follow or edit button.
import SignOutButton from "@/components/social-auth-buttons/sign-out-button";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "../UserAvatar";

type ProfileHeaderProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string | null;
  bio: string | null;
  isOwnProfile: boolean;
  onEditPress: () => void;
  onFollowPress: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
};

export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  bio,
  isOwnProfile,
  onEditPress,
  onFollowPress,
  onFollowersPress,
  onFollowingPress,
  isFollowing,
  followersCount,
  followingCount,
}: ProfileHeaderProps) {
  const showUnfollowStyle = !isOwnProfile && isFollowing;

  const bioText = bio?.trim()
    ? bio
    : isOwnProfile
      ? "Add a bio to tell people about your taste. ✍️"
      : "This person prefers to let the food do the talking. 🍜";

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
        <Text className="text-[13px] text-[#999] mb-2">@{username}</Text>
      )}

      {/* Bio */}
      <Text
        className={`text-[13px] text-center leading-5 mb-4 max-w-[280px] ${bio?.trim() ? "text-[#444]" : "text-[#AAA] italic"
          }`}
      >
        {bioText}
      </Text>

      {/* Instagram-Style Stats Row — tap to see who */}
      <View className="flex-row justify-center gap-10 mb-5">
        <TouchableOpacity
          className="items-center"
          activeOpacity={0.7}
          onPress={onFollowersPress}
        >
          <Text className="text-lg font-bold text-[#1A1A1A]">
            {followersCount}
          </Text>
          <Text className="text-xs text-[#666] mt-0.5">Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          activeOpacity={0.7}
          onPress={onFollowingPress}
        >
          <Text className="text-lg font-bold text-[#1A1A1A]">
            {followingCount}
          </Text>
          <Text className="text-xs text-[#666] mt-0.5">Following</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering based on isOwnProfile */}
      <TouchableOpacity
        className={`px-9 py-2.5 rounded-3xl ${showUnfollowStyle ? "bg-[#EEE]" : "bg-accent"
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