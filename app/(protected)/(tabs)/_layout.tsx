import { COLORS, useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { ComponentProps } from "react";
import { TouchableOpacity, View } from "react-native";

function TabBarIcon(props: {
  name: ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={24} {...props} />;
}

function AddPostButton() {
  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={() => router.push("/new")}
        activeOpacity={0.85}
        style={{
          top: -16,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: COLORS.accent,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const c = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.line,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="plus"
        options={{
          title: "",
          tabBarButton: () => <AddPostButton />,
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
