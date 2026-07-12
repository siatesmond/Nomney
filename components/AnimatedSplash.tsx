// Animated loading splash. Shows the mascot + logo with a gentle pulse, then
// fades out once the app is ready. Sits on top of the app and covers the native
// splash so the hand-off looks smooth.
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function AnimatedSplash({
  loading,
  onFinish,
}: {
  loading: boolean;
  onFinish: () => void;
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(1);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    // Gentle continuous pulse while loading.
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.92, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    // Keep it up long enough to actually see the animation, even if load is instant.
    const t = setTimeout(() => setMinTimePassed(true), 1200);
    return () => clearTimeout(t);
  }, [scale]);

  useEffect(() => {
    // Once loaded (and the min time has passed), fade out and tell the parent.
    if (!loading && minTimePassed) {
      opacity.value = withTiming(0, { duration: 450 }, (done) => {
        if (done) runOnJS(onFinish)();
      });
    }
  }, [loading, minTimePassed, onFinish, opacity]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.container, containerStyle]}
    >
      <Animated.Image
        source={require("@/assets/images/icon/mascotWithLogo.png")}
        resizeMode="contain"
        style={[styles.icon, iconStyle]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  icon: {
    width: 220,
    height: 220,
  },
});
