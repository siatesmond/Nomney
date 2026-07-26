import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export type ImageSource = "camera" | "gallery";

// `initial` lets the edit screen start with the post's existing photos.
// `onNotify` surfaces limit/permission messages through the app's own UI (the
// screen decides how — toast or dialog) instead of a system Alert.
export function useNewPostImages(
  initial: string[] = [],
  onNotify?: (message: string) => void,
) {
  const [images, setImages] = useState<string[]>(initial);
  const MAX_IMAGES = 6;

  const processImage = async (uri: string) => {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.7,
    });
    return manipResult.uri;
  };

  const pickImages = async (source: ImageSource) => {
    const isCamera = source === "camera";
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0)
      return onNotify?.("You can add up to 6 photos.");

    const permission = isCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted)
      return onNotify?.("We need access to your photos to continue.");

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
    pickImages,
    removeImage: (uri: string) =>
      setImages((prev) => prev.filter((i) => i !== uri)),
  };
}
