import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/UserAvatar";
import { COLORS } from "@/constants/theme";
import { Comment } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { addComment } from "@/lib/comments";

type CommentSheetProps = {
  comments: Comment[];
  postId: string | null;
  onNewCommentAdded: (newComment: Comment) => void;
};

export const CommentSheet = React.forwardRef<BottomSheetModal,
  CommentSheetProps
>(({ comments, postId, onNewCommentAdded }, ref) => {
  const snapPoints = useMemo(() => ["60%"], []);
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState("");

  const { profile } = useAuthContext();

  const handleAddComment = async () => {
    if (!inputValue.trim() || !postId || !profile?.id) return;
    try {
      const newComment = await addComment(postId, profile.id, inputValue);
      onNewCommentAdded(newComment);

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

  const renderItem = useCallback(({ item }: { item: Comment }) => {
    return (
      <View className="mb-3">
        <View className="flex-row items-start">
          <View className="mr-2.5">
            <Avatar
              avatarUrl={item.avatar}
              displayName={item.username || "user"}
              size="xs"
              shadow={false}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-bold">{item.username}</Text>
              <Text className="text-xs text-gray-400">{item.timeAgo}</Text>
            </View>
            <Text>{item.content}</Text>
          </View>
        </View>
      </View>
    );
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
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

      <BottomSheetFlatList
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
          <BottomSheetTextInput
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
          <Text
            onPress={handleAddComment}
            style={{ fontWeight: "700", color: COLORS.accent }}
          >
            Send
          </Text>
        </View>
      </View>
    </BottomSheetModal>
  );
});

CommentSheet.displayName = "CommentSheet";