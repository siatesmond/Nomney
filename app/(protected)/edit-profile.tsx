import { Avatar } from "@/components/UserAvatar";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useAvatarPicker } from "@/hooks/useAvatarPicker";
import {
    UsernameStatus,
    useUsernameAvailability,
} from "@/hooks/useUsernameAvailability";
import { EditableProfile, updateProfile, uploadAvatar } from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import { readAsStringAsync } from "expo-file-system/legacy";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/providers/toast-provider";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Form to edit your profile: username, name, bio and photo.
export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, claims, refreshProfile } = useAuthContext();
    const userId = profile?.id ?? claims?.sub;
    const { showToast } = useToast();
    const { alert, confirmHost } = useConfirm();

    // Form state, seeded from the current profile
    const [username, setUsername] = useState(profile?.username ?? "");
    const [firstName, setFirstName] = useState(profile?.first_name ?? "");
    const [lastName, setLastName] = useState(profile?.last_name ?? "");
    const [bio, setBio] = useState(profile?.bio ?? "");
    const [saving, setSaving] = useState(false);

    const { avatarUrl, localUri, pickAvatar } = useAvatarPicker(
        profile?.avatar_url ?? null,
        (m) => alert("Heads up", m),
    );

    const usernameStatus = useUsernameAvailability(
        username,
        profile?.username ?? "",
        userId,
    );

    const isMounted = useRef(true);

    const canSave =
        !saving &&
        usernameStatus !== "taken" &&
        usernameStatus !== "too_short" &&
        usernameStatus !== "checking" &&
        username.trim().length >= 3;

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            let finalAvatarUrl = avatarUrl;

            if (localUri) {
                const base64 = await readAsStringAsync(localUri, {
                    encoding: "base64",
                });
                finalAvatarUrl = await uploadAvatar(userId, decode(base64));
            }

            const fields: EditableProfile = {
                username,
                first_name: firstName,
                last_name: lastName,
                bio,
                avatar_url: finalAvatarUrl,
            };

            await updateProfile(userId, fields);
            await refreshProfile();

            router.back();
            showToast("Profile updated", "success");
        } catch (error: any) {
            const msg =
                error?.code === "23505"
                    ? "That username is already taken."
                    : error?.message || "Could not save your profile.";
            alert("Error", msg);
        } finally {
            if (isMounted.current) setSaving(false);
        }
    };

    const displayName =
        [firstName, lastName].filter(Boolean).join(" ") || username || "You";

    return (
        <View className="flex-1 bg-[#FDFCF9]">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-12 pb-4 border-b border-neutral-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-base text-neutral-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold text-neutral-900">
                    Edit Profile
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={!canSave}>
                    <Text
                        className={`text-base font-semibold ${canSave ? "text-accent" : "text-neutral-300"
                            }`}
                    >
                        Save
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
                <AvatarPicker
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    onPress={pickAvatar}
                />

                <View className="px-5">
                    <Field label="Username">
                        <TextInput
                            className="text-base text-neutral-900 py-2"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            placeholder="username"
                            placeholderTextColor="#999"
                        />
                        <UsernameHint status={usernameStatus} />
                    </Field>

                    <Field label="First Name">
                        <TextInput
                            className="text-base text-neutral-900 py-2"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First name"
                            placeholderTextColor="#999"
                        />
                    </Field>

                    <Field label="Last Name">
                        <TextInput
                            className="text-base text-neutral-900 py-2"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last name"
                            placeholderTextColor="#999"
                        />
                    </Field>

                    <Field label="Bio">
                        <TextInput
                            className="text-base text-neutral-900 py-2 min-h-[60px]"
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell people about yourself"
                            placeholderTextColor="#999"
                            multiline
                            maxLength={150}
                        />
                        <Text className="text-xs text-neutral-400 text-right">
                            {bio.length}/150
                        </Text>
                    </Field>
                </View>
            </ScrollView>

            {saving && (
                <View className="absolute inset-0 bg-black/30 justify-center items-center">
                    <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
            )}

            {confirmHost}
        </View>
    );
}

const AvatarPicker = ({
    avatarUrl,
    displayName,
    onPress,
}: {
    avatarUrl: string | null;
    displayName: string;
    onPress: () => void;
}) => (
    <View className="items-center py-6">
        <Avatar avatarUrl={avatarUrl} displayName={displayName} size="lg" shadow />
        <TouchableOpacity onPress={onPress} className="mt-3">
            <Text className="text-sm font-semibold text-accent">Change Photo</Text>
        </TouchableOpacity>
    </View>
);

const Field = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <View className="py-3 border-b border-neutral-100">
        <Text className="text-xs font-semibold text-neutral-400 uppercase mb-1">
            {label}
        </Text>
        {children}
    </View>
);

const UsernameHint = ({ status }: { status: UsernameStatus }) => {
    if (status === "checking")
        return <Text className="text-xs text-neutral-400">Checking…</Text>;
    if (status === "available")
        return (
            <View className="flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text className="text-xs text-green-600">Available</Text>
            </View>
        );
    if (status === "taken")
        return <Text className="text-xs text-red-600">Already taken</Text>;
    if (status === "too_short")
        return (
            <Text className="text-xs text-red-600">
                Must be at least 3 characters
            </Text>
        );
    return null;
};