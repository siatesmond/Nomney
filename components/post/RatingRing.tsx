import { Text, View } from "react-native";

const ACCENT = "#F4522A";
const ACCENT_SOFT = "#FFEDE5";
const LINE = "#E9E2D6";
const MUTED = "#8A8378";

export function RatingRing({
    rating,
    size = 72,
}: {
    rating: number | null;
    size?: number;
}) {
    const hasRating = rating !== null && rating !== undefined;

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#fff",
                borderWidth: 3,
                borderColor: hasRating ? ACCENT : LINE,
                padding: 4,
            }}
            className="items-center justify-center"
        >
            <View
                style={{
                    width: size - 16,
                    height: size - 16,
                    borderRadius: (size - 16) / 2,
                    borderWidth: 1,
                    borderColor: hasRating ? ACCENT_SOFT : LINE,
                }}
                className="items-center justify-center"
            >
                {hasRating ? (
                    <Text style={{ color: ACCENT }} className="text-lg font-black">
                        {rating!.toFixed(1)}
                    </Text>
                ) : (
                    <Text style={{ color: MUTED }} className="text-[10px] font-bold">
                        N/A
                    </Text>
                )}
            </View>
        </View>
    );
}