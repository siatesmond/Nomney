import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

import { useAuthContext } from "@/hooks/use-auth-context";
import { addComment } from "@/lib/comments";

type Comment = {
  id: string;
  content: string;
  username: string;
  avatar: string | null;
  timeAgo: string;
};

type CommentSheetProps = {
  comments: Comment[];
  postId: string | null;
  onNewCommentAdded: (newComment: Comment) => void;
};

export const CommentSheet = React.forwardRef(({ comments, postId, onNewCommentAdded }, ref) => {
  const snapPoints = useMemo(() => ["60%"], []);
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState(""); // input comment

  const { profile } = useAuthContext();

  const handleAddComment = async () => {
    if (!inputValue.trim()) return;
    try {
      const newComment = await addComment(postId, profile.id, inputValue);
      onNewCommentAdded(newComment); // update UI with newly added comment

      console.log("New comment:", JSON.stringify(newComment, null, 2));
      setInputValue("");
    } catch (error) {
      console.log(error);
    }
  };

  const renderHeader = () => (
    <View className="items-center py-2.5 border-b border-gray-200 bg-white">
      <Text className="font-bold">Comments</Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View className="mb-3">
        <View className="flex-row items-start">
          <Image
            source={{ uri: item.avatar }}
            className="w-9 h-9 rounded-full mr-2.5"
          />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-bold">{item.username}</Text>
              <Text className="text-xs text-gray-400">{item.timeAgo}</Text>
            </View>
            <Text>{item.content}</Text>
          </View>
        </View>
      </View>
    ),
    [],
  );

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
    >
      {renderHeader()}

      <BottomSheetFlatList // Handles scrolling only for comments list
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="items-center">
            <Text className="text-gray-400">No comments yet.</Text>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 20,
        }}
      />

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
          padding: 10,
          paddingBottom: insets.bottom,
          backgroundColor: "white",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <BottomSheetTextInput // Input comment
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add a comment..."
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <Text // Send button
            onPress={handleAddComment}
            style={{ fontWeight: "700", color: "#FA5A40" }}
          >
            Send
          </Text>
        </View>
      </View>
    </BottomSheetModal>
  );
});
