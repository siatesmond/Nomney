import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
};

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 6) / 3;
const ACCENT = '#F4522A';

// Placeholder grid images — replace with real posts/saved data when ready
const PLACEHOLDER_POSTS = [
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=400',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400',
];

const PLACEHOLDER_SAVED = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400',
];

// ─── Hook: fetch profile from Supabase ───────────────────────────────────────

function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        // 1. Get the currently logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error('Not authenticated');

        // 2. Fetch their profile row
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, username, bio, avatar_url, followers_count, following_count')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(data);

        // 3. Resolve avatar URL — handles both full URLs and Storage paths
        if (data.avatar_url) {
          if (data.avatar_url.startsWith('http')) {
            setAvatarUrl(data.avatar_url);
          } else {
            const { data: urlData } = supabase.storage
              .from('avatars') // 👈 change bucket name if different
              .getPublicUrl(data.avatar_url);
            setAvatarUrl(urlData.publicUrl);
          }
        }
      } catch (err: any) {
        setError(err.message ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, avatarUrl, loading, error };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { profile, avatarUrl, loading, error } = useProfile();
  const [activeTab, setActiveTab] = useState<'Posts' | 'Saved'>('Posts');

  const gridData = activeTab === 'Posts' ? PLACEHOLDER_POSTS : PLACEHOLDER_SAVED;

  // ── Loading state ──
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  // ── Error state ──
  if (error || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Profile not found'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Profile Header ── */}
        <View style={styles.header}>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>
                  {(profile.full_name ?? profile.username ?? '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.name}>
            {profile.full_name ?? profile.username ?? 'Anonymous'}
          </Text>

          {/* Username */}
          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}

          {/* Bio */}
          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : (
            <Text style={[styles.bio, styles.bioEmpty]}>No bio yet.</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.followers_count ?? 0}</Text>
              <Text style={styles.statLabel}> Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.following_count ?? 0}</Text>
              <Text style={styles.statLabel}> Following</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton} activeOpacity={0.85}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tab Selector ── */}
        <View style={styles.tabRow}>
          {(['Posts', 'Saved'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Image Grid ──
            TODO: Replace PLACEHOLDER_POSTS / PLACEHOLDER_SAVED with real Supabase
            queries once you add a `posts` or `saved_posts` table. */}
        <View style={styles.grid}>
          {gridData.map((uri, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9} style={styles.gridItem}>
              <Image source={{ uri }} style={styles.gridImage} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  errorText: {
    color: '#999',
    fontSize: 14,
  },

  // ── Header ──────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
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
    marginBottom: 10,
  },
  bio: {
    fontSize: 13.5,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    maxWidth: 280,
  },
  bioEmpty: {
    fontStyle: 'italic',
    color: '#BBB',
  },

  // ── Stats ────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
  },
  statLabel: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#DDD',
  },

  // ── Edit Button ──────────────────────────────────
  editButton: {
    backgroundColor: ACCENT,
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: ACCENT,
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

  // ── Tab Row ──────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 24,
    marginHorizontal: 60,
    marginBottom: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  // ── Grid ─────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    paddingHorizontal: 3,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});