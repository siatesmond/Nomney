import { ImageGridItem } from "@/constants/types";
import { Profile } from "@/constants/types";
import { supabase } from "./supabase";

const AVATAR_BUCKET = "avatars";

export type EditableProfile = {
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string | null;
};

export async function isUsernameAvailable(
    username: string,
    currentUserId: string,
): Promise<boolean> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", currentUserId)
        .maybeSingle();

    if (error) throw error;
    return !data;
}

export async function uploadAvatar(
    userId: string,
    arrayBuffer: ArrayBuffer,
): Promise<string> {
    const fileName = `${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    const { data: existing } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list(userId);

    const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, arrayBuffer, {
            contentType: "image/jpeg",
            upsert: false,
        });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath);

    if (existing && existing.length > 0) {
        const oldPaths = existing
            .filter((f) => f.name !== fileName)
            .map((f) => `${userId}/${f.name}`);
        if (oldPaths.length > 0) {
            await supabase.storage.from(AVATAR_BUCKET).remove(oldPaths);
        }
    }

    return publicUrlData.publicUrl;
}

export async function updateProfile(
    userId: string,
    fields: EditableProfile,
): Promise<void> {
    const full_name =
        [fields.first_name.trim(), fields.last_name.trim()]
            .filter(Boolean)
            .join(" ") || null;

    const { error } = await supabase
        .from("profiles")
        .update({
            username: fields.username.trim(),
            first_name: fields.first_name.trim() || null,
            last_name: fields.last_name.trim() || null,
            full_name,
            bio: fields.bio.trim() || null,
            avatar_url: fields.avatar_url,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    if (error) throw error;
}

export type ProfileWithStats = {
    profile: Profile;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
};

export function resolveAvatarUrl(avatarUrl: string | null): string | null {
    if (!avatarUrl) return null;
    return avatarUrl.startsWith("http")
        ? avatarUrl
        : supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarUrl).data
            .publicUrl;
}

export async function getProfileWithStats(
    userId: string,
    viewerId?: string,
): Promise<ProfileWithStats> {
    const profilePromise = supabase
        .from("profiles")
        .select("id, full_name, username, first_name, last_name, avatar_url, bio")
        .eq("id", userId)
        .single();

    const followersPromise = supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

    const followingPromise = supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

    const relationshipPromise =
        viewerId && viewerId !== userId
            ? supabase
                .from("followers")
                .select("*")
                .eq("follower_id", viewerId)
                .eq("following_id", userId)
                .maybeSingle()
            : Promise.resolve({ data: null });

    const [profileRes, followersRes, followingRes, relationshipRes] =
        await Promise.all([
            profilePromise,
            followersPromise,
            followingPromise,
            relationshipPromise,
        ]);

    if (profileRes.error) throw profileRes.error;

    return {
        profile: profileRes.data as Profile,
        followersCount: followersRes.count ?? 0,
        followingCount: followingRes.count ?? 0,
        isFollowing: !!relationshipRes.data,
    };
}

function firstImageUrl(
    postImages: { image_url: string; display_order: number }[] | null | undefined,
): string | undefined {
    const sorted = (postImages || [])
        .slice()
        .sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url;
}

export async function getUserPostImages(
    userId: string,
): Promise<ImageGridItem[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("id, created_at, post_image (image_url, display_order)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? [])
        .map((post: any) => ({
            id: post.id,
            imageUrl: firstImageUrl(post.post_image),
        }))
        .filter((p): p is ImageGridItem => !!p.imageUrl);
}

export async function getSavedPostImages(
    userId: string,
): Promise<ImageGridItem[]> {
    const { data, error } = await supabase
        .from("saves")
        .select("post_id, posts (id, post_image (image_url, display_order))")
        .eq("user_id", userId);

    if (error) throw error;

    return (data ?? [])
        .map((item: any) => {
            const post = item.posts;
            if (!post) return null;
            return {
                id: post.id,
                imageUrl: firstImageUrl(post.post_image),
            };
        })
        .filter((p): p is ImageGridItem => !!p && !!p.imageUrl);
}