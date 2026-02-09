import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEvents } from '@/features/schedule/hooks/useEvents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

export default function ScheduleScreen() {
    const { data: events, isLoading, error } = useEvents();

    if (isLoading) return <View style={styles.center}><Text>Loading Schedule...</Text></View>;
    if (error) return <View style={styles.center}><Text>Error loading schedule: {error.message}</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Schedule (Skeleton)</Text>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: import('@/features/schedule/types').Event }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text>{format(new Date(item.starts_at), 'PP p')}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{ padding: 20 }}>No events found.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    itemTitle: { fontWeight: 'bold' },
});
