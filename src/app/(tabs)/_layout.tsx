import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { colors } from '@/theme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color }) => <FontAwesome name="check-square-o" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: 'AI Assistant',
                    tabBarIcon: ({ color }) => <FontAwesome name="magic" size={28} color={color} />,
                }}
            />
            {/* Hidden tabs or other screens can be added here if needed */}
        </Tabs>
    );
}
