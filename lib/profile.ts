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

    // List existing files first, so we can clean them up after the new one lands.
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