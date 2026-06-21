import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "#F4522A";

type Tab = "Posts" | "Saved";

type ProfileTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs: Tab[] = ["Posts", "Saved"];

  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            activeTab === tab && styles.tabButtonActive,
          ]}
          onPress={() => onTabChange(tab)}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#EFEFEF",
    borderRadius: 24,
    marginHorizontal: 60,
    marginBottom: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
});
