import { UserProfile } from '@/components/profile/UserProfile';
import SignOutButton from '@/components/social-auth-buttons/sign-out-button';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useNavigation } from '@react-navigation/native';

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

export default function ProfileScreen() {
    const { profile } = useAuthContext()
    const navigation = useNavigation();
    
    if (!profile) return null;

    return (
        <>
            <UserProfile
                userId={profile.id}
                isOwnProfile={true}
                postImages={PLACEHOLDER_POSTS}
                savedImages={PLACEHOLDER_SAVED}
            />

            <SignOutButton />
        </>
    );
}