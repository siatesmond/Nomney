import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export function useNewPostImages() {
  const [images, setImages] = useState<string[]>([]);
  const MAX_IMAGES = 6;

  const processImage = async (uri: string) => {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.7, // Slightly higher compression for faster uploads
    });
    return manipResult.uri;
  };

  const handlePicker = async (isCamera: boolean) => {
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0)
      return Alert.alert("Limit Reached", "Max 6 photos allowed.");

    const permission = isCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted)
      return Alert.alert(
        "Permission denied",
        "We need access to your photos to proceed.",
      );

    const pickerMethod = isCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await pickerMethod({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: !isCamera,
      selectionLimit: remainingSlots,
    });

    if (!result.canceled) {
      const newUris = await Promise.all(
        result.assets.slice(0, remainingSlots).map((a) => processImage(a.uri)),
      );
      setImages((prev) => [...prev, ...newUris]);
    }
  };

  return {
    images,
    showOptions: () =>
      Alert.alert("Add Photo", "Choose an option", [
        { text: "Camera", onPress: () => handlePicker(true) },
        { text: "Gallery", onPress: () => handlePicker(false) },
        { text: "Cancel", style: "cancel" },
      ]),
    removeImage: (uri: string) =>
      setImages((prev) => prev.filter((i) => i !== uri)),

    // Prepare image for Supabase Storage
    getProcessedData: async (uri: string) => {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return {
        arrayBuffer: decode(base64),
        fileName: `post_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
        contentType: "image/jpeg",
      };
    },
  };
}
