import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { InputWithIcon } from "../../components/ui/InputWithIcon";
import { Button } from "../../components/ui/BlackButton";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

export default function CompleteProfile() {
  const params = useLocalSearchParams<{
    firstName?: string;
    lastName?: string;
  }>();

  const [firstName, setFirstName] = useState(params.firstName || "");
  const [lastName, setLastName] = useState(params.lastName || "");
  const [username, setUsername] = useState("");

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [loading, setLoading] = useState(false);

  const capitalize = (str: string) =>
    str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();

  const handleSave = async () => {
    setFirstNameError("");
    setLastNameError("");
    setUsernameError("");

    if (!firstName) {
      setFirstNameError("First name is required");
      return;
    }
    if (!lastName) {
      setLastNameError("Last name is required");
      return;
    }
    if (!username) {
      setUsernameError("Username is required");
      return;
    }

    try {
      setLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error("Failed to get user:", userError);
        setUsernameError("Something went wrong. Please try again.");
        return;
      }

      // Check if username exists
      const { data: existing, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", userData.user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Failed to check username:", checkError);
      }

      if (existing) {
        setUsernameError("That username is already taken!");
        return;
      }

      // Update db with profile details
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: capitalize(firstName),
          last_name: capitalize(lastName),
          username,
        })
        .eq("id", userData.user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
        setUsernameError(
          updateError.message || "Something went wrong. Please try again.",
        );
        return;
      }

      router.replace("/register-success");
    } catch (err) {
      console.error("Unexpected error:", err);
      setUsernameError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-3xl font-bold mb-4">Complete your profile</Text>
      <Text className="text-[#707070] text-sm mb-8">
        Confirm your details and choose a username to get started!
      </Text>


      {/* First Name Input */}
      <InputWithIcon
        icon={<Ionicons name="person-outline" size={20} color="#838383" />}
        placeholder="First Name"
        value={firstName} //pre-filled from Google profile
        onChangeText={(text) => {
          setFirstName(text);
          setFirstNameError("");
        }}
        autoCapitalize="words"
      />
      {/* Last Name Input */}
      <InputWithIcon
        icon={<Ionicons name="person-outline" size={20} color="#838383" />}
        placeholder="Last Name"
        value={lastName} //pre-filled from Google profile
        onChangeText={(text) => {
          setLastName(text);
          setLastNameError("");
        }}
        autoCapitalize="words"
      />
      {/* Username Input */}
      <InputWithIcon
        icon={<Ionicons name="at-outline" size={20} color="#838383" />}
        placeholder="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text.toLowerCase());
          setUsernameError("");
        }}
        autoCapitalize="none"
      />
      {firstNameError || lastNameError || usernameError ? (
        <Text
          style={{
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            padding: 10,
            borderRadius: 8,
            marginTop: 14,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          {firstNameError || lastNameError || usernameError}
        </Text>
      ) : null}
      {/* Submit button */}
      <Button
        title={loading ? "Setting up..." : "Continue"}
        onPress={handleSave}
        disabled={loading}
      />
    </Screen>
  );
}
