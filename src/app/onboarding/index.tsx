import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirstLaunch } from '@/hooks/useFirstLaunch';

export default function OnboardingScreen() {
    const router = useRouter();
    const { setLaunched } = useFirstLaunch();

    const handleGetStarted = () => {
        setLaunched();
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Mox</Text>
                <Text style={styles.subtitle}>Your simple, intelligent schedule.</Text>

                {/* Placeholder for Mascot/Image */}
                <View style={styles.imagePlaceholder}>
                    <Text>Mascot Image Here</Text>
                </View>

                <Pressable style={styles.button} onPress={handleGetStarted}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
    },
    imagePlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
        borderRadius: 20,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
