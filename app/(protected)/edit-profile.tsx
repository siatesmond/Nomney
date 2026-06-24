import { Avatar } from "@/components/UserAvatar";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
    EditableProfile,
    isUsernameAvailable,
    updateProfile,
    uploadAvatar,
} from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import { readAsStringAsync } from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, claims, refreshProfile } = useAuthContext();
    const userId = profile?.id ?? claims?.sub;

    // Form state, seeded from the current profile
    const [username, setUsername] = useState(profile?.username ?? "");
    const [firstName, setFirstName] = useState(profile?.first_name ?? "");
    const [lastName, setLastName] = useState(profile?.last_name ?? "");
    const [bio, setBio] = useState(profile?.bio ?? "");

    // Avatar: localUri is a freshly-picked image not yet uploaded
    const [avatarUrl, setAvatarUrl] = useState<string | null>(
        profile?.avatar_url ?? null,
    );
    const [localUri, setLocalUri] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);

    // Username availability check (debounced)
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "too_short">("idle");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    useEffect(() => {
        const trimmed = username.trim();

        // Unchanged from current name → nothing to validate
        if (trimmed === (profile?.username ?? "")) {
            setUsernameStatus("idle");
            return;
        }
        if (trimmed.length < 3) {
            setUsernameStatus("too_short");
            return;
        }

        setUsernameStatus("checking");
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const ok = await isUsernameAvailable(trimmed, userId!);
                if (isMounted.current)
                    setUsernameStatus(ok ? "available" : "taken");
            } catch {
                if (isMounted.current) setUsernameStatus("idle");
            }
        }, 500);
    }, [username, profile?.username, userId]);

    const pickAvatar = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return Alert.alert(
                "Permission denied",
                "We need access to your photos to change your avatar.",
            );
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const manip = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 512, height: 512 } }],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.7 },
            );
            setLocalUri(manip.uri);
            setAvatarUrl(manip.uri); // preview immediately
        }
    };

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

            Alert.alert("Saved", "Your profile has been updated.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const msg =
                error?.code === "23505"
                    ? "That username is already taken."
                    : error?.message || "Could not save your profile.";
            Alert.alert("Error", msg);
        } finally {
            if (isMounted.current) setSaving(false);
        }
    };

    const displayName =
        [firstName, lastName].filter(Boolean).join(" ") || username || "You";

    return (
        <View className="flex-1 bg-white">
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
                        className={`text-base font-semibold ${canSave ? "text-[#F4522A]" : "text-neutral-300"
                            }`}
                    >
                        Save
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
                {/* Avatar */}
                <View className="items-center py-6">
                    <Avatar
                        avatarUrl={avatarUrl}
                        displayName={displayName}
                        size="lg"
                        shadow
                    />
                    <TouchableOpacity onPress={pickAvatar} className="mt-3">
                        <Text className="text-sm font-semibold text-[#F4522A]">
                            Change Photo
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="px-5">
                    {/* Username */}
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

                    {/* First / Last name */}
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

                    {/* Bio */}
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
                    <ActivityIndicator size="large" color="#F4522A" />
                </View>
            )}
        </View>
    );
}

// --- Small presentational helpers ---

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

const UsernameHint = ({ status }: { status: string }) => {
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