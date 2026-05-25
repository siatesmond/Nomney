import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
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
    /* Height of sheet */
    const snapPoints = useMemo(() => ["60%", "90%"], []); // half or full

    const insets = useSafeAreaInsets();

    const renderHeader = () => {
      return (
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
        </View>
      );
    };

    const renderItem = useCallback(({ item }) => {
      return (
        <View style={styles.commentItem}>
          <View style={styles.row}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

            <View style={styles.textContainer}>
              <Text style={styles.username}>{item.username}</Text>
              <Text>{item.text}</Text>
            </View>
          </View>
        </View>
      );
    }, []);

    const renderFooter = useCallback(() => <View />, []);

    const renderBackdrop = useCallback(
      (props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close" // Close sheet on backdrop click
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
        enableDynamicSizing={false} // Lets sheet height be controlled only by snapPoints
        enableContentPanningGesture={false} // Keeps scrolling inside the list
        enableHandlePanningGesture={true}
        enableOverDrag={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      >
        {renderHeader()}

        {/* Scrollable content inside sheet */}
        <BottomSheetFlatList
          style={{ flex: 1 }}
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          ListFooterComponentStyle={{ height: 200 }} // Forces scroll space
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        />
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },

  title: {
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
  },

  commentItem: {
    marginBottom: 12,
  },

  username: {
    fontWeight: "bold",
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
