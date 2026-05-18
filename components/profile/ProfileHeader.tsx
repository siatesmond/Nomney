import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Avatar } from '../UserAvatar';

const ACCENT = '#F4522A';

type ProfileHeaderProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string | null;
  onEditPress: () => void;
  onLogoutPress: () => void;
};

export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  onEditPress,
  onLogoutPress,
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

      <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={onEditPress}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#F4522A',
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#F4522A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  logoutButton: {
    marginTop: 12,
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  logoutText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
});