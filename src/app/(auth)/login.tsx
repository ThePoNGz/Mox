import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        setLoading(false);
        // Auth state change will handle redirect in root layout/index
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        else Alert.alert('Check your inbox for email verification!');
        setLoading(false);
    }

    async function signInAnonymously() {
        setLoading(true);
        console.log('Attempting anonymous sign in...');
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
            console.error('Anon sign in error:', error);
            Alert.alert(error.message);
            setLoading(false);
        } else {
            console.log('Anon sign in success:', data);
        }
        // Redirect handled by auth state listener
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.buttonGap}>
                        <Button title={loading ? "Loading..." : "Sign In"} disabled={loading} onPress={signInWithEmail} />
                    </View>
                    <View style={styles.buttonGap}>
                        <Button title="Sign Up" disabled={loading} onPress={signUpWithEmail} />
                    </View>
                </View>

                <View style={styles.separator}>
                    <View style={styles.line} />
                    <Text style={styles.separatorText}>OR</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.anonContainer}>
                    <Pressable
                        style={({ pressed }) => [styles.anonButton, pressed && styles.anonPressed]}
                        onPress={signInAnonymously}
                        disabled={loading}
                    >
                        <Text style={styles.anonText}>Continue without account</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
    form: { gap: 12 },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: '#fafafa'
    },
    buttonGap: { marginTop: 8 },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32
    },
    line: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
    separatorText: { marginHorizontal: 16, color: '#999', fontWeight: '600' },
    anonContainer: { alignItems: 'center' },
    anonButton: { padding: 12 },
    anonPressed: { opacity: 0.6 },
    anonText: { color: '#666', fontSize: 16, fontWeight: '500', textDecorationLine: 'underline' }
});
