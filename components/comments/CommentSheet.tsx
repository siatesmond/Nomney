import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

type CommentSheetProps = {
  comments: any[];
};

export const CommentSheet = React.forwardRef<BottomSheet, CommentSheetProps>(
  ({ comments }, ref) => {
    const snapPoints = useMemo(() => ["60%", "90%"], []);
    const insets = useSafeAreaInsets();

    const renderHeader = () => (
      <View className="items-center py-2.5 border-b border-gray-200 bg-white">
        <Text className="font-bold">Comments</Text>
      </View>
    );

    const renderItem = useCallback(({ item }) => (
      <View className="mb-3">
        <View className="flex-row items-start">
          <Image
            source={{ uri: item.avatar }}
            className="w-9 h-9 rounded-full mr-2.5"
          />
          <View className="flex-1">
            <Text className="font-bold">{item.username}</Text>
            <Text>{item.text}</Text>
          </View>
        </View>
      </View>
    ), []);

    const renderFooter = useCallback(() => <View />, []);

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
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={true}
        enableOverDrag={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }} // Keep inline - component config
      >
        {renderHeader()}

        <BottomSheetFlatList
          className="flex-1"
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          ListFooterComponentStyle={{ height: 200 }} // Keep inline - dynamic footer height
          contentContainerStyle={[
            {
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: insets.bottom + 16, // Dynamic value - needs inline
            },
          ]}
        />
      </BottomSheet>
    );
  },
);