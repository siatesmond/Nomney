import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs } from './ProfileTabs';
import { ImageGrid } from './ImageGrid';
import { supabase } from '@/lib/supabase';

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
    onLogout?: () => void;
    onFollow?: () => void;
    postImages?: string[];
    savedImages?: string[];
};

export function UserProfile({
    userId,
    isOwnProfile,
    onEdit,
    onLogout,
    onFollow,
    postImages = [],
    savedImages = [],
}: UserProfileProps) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'Posts' | 'Saved'>('Posts');
    const [isFollowing, setIsFollowing] = useState(false);

    const ACCENT = '#F4522A';

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);

                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, username, first_name, last_name, avatar_url')
                    .eq('id', userId)
                    .single();

                if (profileError) throw profileError;

                setProfile(data);

                if (data.avatar_url) {
                    if (data.avatar_url.startsWith('http')) {
                        setAvatarUrl(data.avatar_url);
                    } else {
                        const { data: urlData } = supabase.storage
                            .from('avatars')
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
    }, [userId]);

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={ACCENT} />
            </SafeAreaView>
        );
    }

    if (error || !profile) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.errorText}>{error ?? 'Profile not found'}</Text>
            </SafeAreaView>
        );
    }

    const displayName =
        profile.full_name ??
        ([profile.first_name, profile.last_name].filter(Boolean).join(' ') || null) ??
        profile.username ??
        'Anonymous';

    const gridData = activeTab === 'Posts' ? postImages : savedImages;

    return (
        <SafeAreaView style={styles.safeArea}>
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
                    onLogoutPress={onLogout}
                    onFollowPress={() => {
                        setIsFollowing(!isFollowing);
                        onFollow?.();
                    }}
                    isFollowing={isFollowing}
                />

                {!isOwnProfile ? (
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                ) : (
                    // Own profile can see Saved tab
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                )}

                <ImageGrid images={gridData} />
            </ScrollView>
        </SafeAreaView>
    );
}

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
        flexGrow: 1,
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
});