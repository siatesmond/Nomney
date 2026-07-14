import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

interface StreakWidgetProps {
  streakCount: number;
  longestStreak?: number;
}

// Milestone based color 
function getStreakColor(streak: number): string {
  if (streak >= 30) return '#D4AF37'; // yellow
  if (streak >= 14) return '#E85D2C'; // dark orange
  if (streak >= 7) return '#FF8C42';  // medium orange
  if (streak >= 3) return '#FFA766';  // light orange
  return '#9CA3AF';                    // gray — fresh/new streak
}

export function StreakWidgetLarge({ streakCount, longestStreak }: StreakWidgetProps) {
  const streakColor = getStreakColor(streakCount);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
      }}
      clickAction="OPEN_APP"
    >
      {/* Mascot — left side */}
      <FlexWidget
        style={{
          flex: 1,
          height: 'match_parent',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 8,
          marginTop: 2
        }}
      >
        <ImageWidget
          image={require('../assets/images/icon/excited_mascot.png')}
          imageWidth={175}
          imageHeight={170}
        />
      </FlexWidget>

      {/* Streak count — right side */}
      <FlexWidget
        style={{
          flex: 1,
          height: 'match_parent',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          paddingRight: 10,
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="🔥"
            style={{ fontSize: 40, marginRight: 2 }}
          />
          <TextWidget
            text={`${streakCount}`}
            style={{ fontSize: 45, fontWeight: 'bold', color: streakColor }}
          />
        </FlexWidget>


        {longestStreak !== undefined && longestStreak > streakCount && (
          <TextWidget
            text={`beat your best: ${longestStreak}!`}
            style={{ fontSize: 13, color: '#000000', marginTop: 2 }}
          />
        )}
      </FlexWidget>

    </FlexWidget>
  );
}