// The Posts / Saved toggle on a profile.
import { Text, TouchableOpacity, View } from "react-native";

import { COLORS } from "@/constants/theme";

const ACCENT = COLORS.accent;

type Tab = "Posts" | "Saved";

type ProfileTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs: Tab[] = ["Posts", "Saved"];

  return (
    <View className="flex-row bg-[#EFEFEF] rounded-3xl mx-[60px] mb-4 p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 rounded-[20px] items-center ${isActive ? "bg-accent" : ""
              }`}
            style={
              isActive
                ? {
                  shadowColor: ACCENT,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 3,
                }
                : undefined
            }
            onPress={() => onTabChange(tab)}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm ${isActive ? "text-white font-semibold" : "text-[#999] font-medium"
                }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}