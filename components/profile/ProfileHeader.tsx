import SignOutButton from "@/components/social-auth-buttons/sign-out-button";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "../UserAvatar";

const ACCENT = "#F4522A";

type ProfileHeaderProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string | null;
  isOwnProfile: boolean;
  onEditPress: () => void;
  onFollowPress: () => void;
  isFollowing: boolean;
  followersCount: number; // 1. Added followers prop
  followingCount: number; // 1. Added following prop
};

export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  isOwnProfile,
  onEditPress,
  onFollowPress,
  isFollowing,
  followersCount, // Destructure here
  followingCount, // Destructure here
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <Avatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          size="lg"
          shadow={true}
        />
      </View>

      <Text style={styles.name}>{displayName}</Text>
      {username && <Text style={styles.username}>@{username}</Text>}

      {/* 2. Added Instagram-Style Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Conditional Rendering based on isOwnProfile */}
      <TouchableOpacity
        style={[
          styles.button,
          !isOwnProfile && isFollowing && styles.unfollowButton,
        ]}
        activeOpacity={0.85}
        onPress={isOwnProfile ? onEditPress : onFollowPress}
      >
        {/* 3. Added unfollowButtonText dynamic style to make text visible */}
        <Text
          style={[
            styles.buttonText,
            !isOwnProfile && isFollowing && styles.unfollowButtonText,
          ]}
        >
          {isOwnProfile ? "Edit Profile" : isFollowing ? "Unfollow" : "Follow"}
        </Text>
      </TouchableOpacity>

      {isOwnProfile && (
        <View style={styles.logoutContainer}>
          <SignOutButton />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  avatarContainer: { marginBottom: 14 },
  name: { fontSize: 24, fontWeight: "700", color: "#1A1A1A", marginBottom: 2 },
  username: { fontSize: 13, color: "#999", marginBottom: 16 },

  // New layout styles for follow numbers
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40, // Spacing between Followers and Following sections
    marginBottom: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  button: {
    backgroundColor: "#F4522A",
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 4,
  },
  unfollowButton: {
    backgroundColor: "#EEE",
    elevation: 0, // Removes shadow for disabled/unfollow state style preference
  },
  buttonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  unfollowButtonText: { color: "#555" }, // Fix: Dark gray text so it's readable on gray backgrounds
  logoutContainer: { marginTop: 12, width: "100%", alignItems: "center" },
});
