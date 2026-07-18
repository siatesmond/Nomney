import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { getStreakData } from '../lib/streak';
import { supabase } from "./../lib/supabase";
import { StreakWidgetLarge } from './StreakWidgetLarge';
import { StreakWidgetSmall } from './StreakWidgetSmall'; 

const nameToWidget = {
    // Hello is the name with which will reference our widget (in app.json)
    // Hello: HelloWidget
    StreakLarge: StreakWidgetLarge,
    StreakSmall: StreakWidgetSmall,
};

// Get logged-in user's streak data from db
async function getStreakForCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { current: 0, longest: 0 }; // no session, show 0 data
    return getStreakData(session.user.id);
}

// Handles logic of changes to widgets to the home screen (Registered in index.ts)
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

    if (!Widget) return;

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED': {
            const { current, longest } = await getStreakForCurrentUser();
            props.renderWidget(<Widget streakCount={current} longestStreak={longest} />);
            break;
        }

        case 'WIDGET_DELETED':
            break;

        case 'WIDGET_CLICK':
            // clickAction="OPEN_APP" is handled automatically by the library
            break;

        default:
            break;
    }
}