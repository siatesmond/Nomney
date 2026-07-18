import { OverlapWidget, FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

interface StreakWidgetSmallProps {
    streakCount: number;
}

function getStreakColor(streak: number): string {
    if (streak >= 30) return '#D4AF37';
    if (streak >= 14) return '#E85D2C';
    if (streak >= 7) return '#FF8C42';
    if (streak >= 3) return '#FFA766';
    return '#9CA3AF';
}

export function StreakWidgetSmall({ streakCount }: StreakWidgetSmallProps) {
    const streakColor = getStreakColor(streakCount);

    return (
        <OverlapWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
            }}
            clickAction="OPEN_APP"
        >
            {/* Layer 1: Mascot */}
            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >
                <ImageWidget
                    image={require('../assets/images/icon/excited_mascot.png')}
                    imageWidth={180}
                    imageHeight={160}
                    style={{ marginBottom: -60 }}
                />
            </FlexWidget>

            {/* Layer 2: Streak Count */}
            <FlexWidget
                style={{
                    height: 'match_parent',
                    width: 'match_parent',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingTop: 16,
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextWidget text="🔥" style={{ fontSize: 30, marginRight: 4 }} />
                    <TextWidget
                        text={`${streakCount}`}
                        style={{ fontSize: 40, fontWeight: 'bold', color: streakColor }}
                    />
                </FlexWidget>
                <TextWidget
                    text="day streak"
                    style={{ fontSize: 15, color: '#000000' }}
                />
            </FlexWidget>
        </OverlapWidget>
    );
}