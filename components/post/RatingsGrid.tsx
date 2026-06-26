// 2x2 grid showing the food / service / environment / cleanliness star ratings.
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Text, View } from "react-native";

import { COLORS } from "@/constants/theme";

const LINE = COLORS.line;
const GOLD = COLORS.gold;
const MUTED = COLORS.muted;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function Stars({ rating }: { rating: number | null }) {
    if (rating === null || rating === undefined) {
        return (
            <Text style={{ color: MUTED }} className="text-xs font-semibold">
                N/A
            </Text>
        );
    }
    const rounded = Math.round(rating);
    return (
        <View className="flex-row">
            {[...Array(5)].map((_, i) => (
                <Ionicons
                    key={i}
                    name={i < rounded ? "star" : "star-outline"}
                    size={14}
                    color={GOLD}
                    style={{ marginLeft: i === 0 ? 0 : 2 }}
                />
            ))}
        </View>
    );
}

function RatingCell({
    icon,
    label,
    rating,
    side,
    topMargin,
}: {
    icon: IoniconName;
    label: string;
    rating: number | null;
    side: "left" | "right";
    topMargin?: boolean;
}) {
    return (
        <View
            className={`w-1/2 flex-row items-center justify-between ${side === "left" ? "pr-3" : "pl-3"
                }`}
            style={topMargin ? { marginTop: 14 } : undefined}
        >
            <View className="flex-row items-center">
                <Ionicons name={icon} size={14} color={MUTED} />
                <Text
                    style={{ color: MUTED, marginLeft: 6 }}
                    className="text-xs font-semibold"
                >
                    {label}
                </Text>
            </View>
            <Stars rating={rating} />
        </View>
    );
}

export function RatingsGrid({
    food,
    service,
    environment,
    cleanliness,
}: {
    food: number | null;
    service: number | null;
    environment: number | null;
    cleanliness: number | null;
}) {
    return (
        <View
            className="px-5 py-4 flex-row flex-wrap"
            style={{ borderBottomWidth: 1, borderColor: LINE }}
        >
            <RatingCell icon="fast-food-outline" label="Food" rating={food} side="left" />
            <RatingCell
                icon="people-outline"
                label="Service"
                rating={service}
                side="right"
            />
            <RatingCell
                icon="leaf-outline"
                label="Environment"
                rating={environment}
                side="left"
                topMargin
            />
            <RatingCell
                icon="sparkles-outline"
                label="Clean"
                rating={cleanliness}
                side="right"
                topMargin
            />
        </View>
    );
}