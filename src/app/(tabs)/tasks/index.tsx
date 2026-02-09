import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
    const { data: tasks, isLoading, error } = useTasks();

    if (isLoading) return <View style={styles.center}><Text>Loading Tasks...</Text></View>;
    if (error) return <View style={styles.center}><Text>Error loading tasks: {error.message}</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Tasks (Skeleton)</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: import('@/features/tasks/types').Task }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text>Status: {item.status}</Text>
                        {item.due_at && <Text>Due: {new Date(item.due_at).toLocaleDateString()}</Text>}
                    </View>
                )}
                ListEmptyComponent={<Text style={{ padding: 20 }}>No tasks found.</Text>}
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
