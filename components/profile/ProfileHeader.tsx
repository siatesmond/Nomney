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
};

export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  isOwnProfile,
  onEditPress,
  onFollowPress,
  isFollowing,
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

      {/* Conditional Rendering based on isOwnProfile */}
      <TouchableOpacity
        style={[
          styles.button,
          !isOwnProfile && isFollowing && styles.unfollowButton,
        ]}
        activeOpacity={0.85}
        onPress={isOwnProfile ? onEditPress : onFollowPress}
      >
        <Text style={styles.buttonText}>
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
  button: {
    backgroundColor: "#F4522A",
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 4,
  },
  unfollowButton: { backgroundColor: "#EEE" }, // Style for when already following
  buttonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  logoutContainer: { marginTop: 12, width: "100%", alignItems: "center" },
});
