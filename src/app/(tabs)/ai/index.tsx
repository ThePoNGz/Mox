import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function AiScreen() {
    const [input, setInput] = useState('');

    const handleSend = () => {
        // Logic stub
        console.log('Sending to AI:', input);
        setInput('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>AI Assistant (Skeleton)</Text>
            <View style={styles.chatArea}>
                <Text>Chat history will appear here.</Text>
            </View>
            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask AI..."
                    value={input}
                    onChangeText={setInput}
                />
                <Button title="Send" onPress={handleSend} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    chatArea: { flex: 1, backgroundColor: '#f0f0f0', padding: 10, marginBottom: 10 },
    inputArea: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10, borderRadius: 5 },
});
