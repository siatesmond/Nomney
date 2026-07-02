import { useState, useEffect } from "react";
import { Image, Text, View, Pressable } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { Button } from "../../components/ui/BlackButton";
import { router, Stack } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function RegisterSuccess() {
  const [firstName, setFirstName] = useState("");

  // Get user profile
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Failed to load user:", error);
        return;
      }
      const name = data?.user?.user_metadata?.first_name;
      if (name) setFirstName(name);
    };
    loadUser();
  }, []);

  // Routing for buttons
  const handleViewProfile = () => {
    router.replace("/profile");
  };

  const handleSkip = () => {
    router.replace("/home");
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center">
        <View className="w-full items-center">
          {firstName ? (
            <Text className="text-[#838383] font-bold text-2xl text-center mb-1">
              Hello {firstName},
            </Text>
          ) : null}

          <Text className="text-3xl font-extrabold text-center leading-tight px-4">
            Your <Text className="text-[#FF6E4E]">Nomney</Text> journey
          </Text>
          <Text className="text-3xl font-extrabold text-center leading-tight px-4">
            begins here!
          </Text>

          {/* Mascot Icon */}
          <View>
            <Image
              source={require("@/assets/images/icon/mascotWithLogo.png")}
              className="w-52 h-52"
              resizeMode="contain"
            />
          </View>

          <Text className="text-[#838383] text-center text-md mb-1 px-6">
            Your account has been created.
          </Text>
          <Text className="text-[#838383] text-center text-md px-6">
            Head to your profile to finish setting things up.
          </Text>

          {/* Visit Profile Button */}
          <View className="w-80">
            <Button title="View your profile" onPress={handleViewProfile} />
          </View>

          {/* Skip to Home */}
          <Pressable onPress={handleSkip} hitSlop={10} className="mt-4">
            <Text className="text-[#838383] text-md font-bold text-center">
              I'll do this later
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
