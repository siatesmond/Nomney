import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { ComponentProps } from "react";

function TabBarIcon(props: {
  name: ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={24} {...props} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F4522A",
        tabBarInactiveTintColor: "#999",
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
          title: "Add Post",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="add-outline" color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/new");
          },
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
