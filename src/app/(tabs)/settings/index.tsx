/**
 * Settings Index Screen
 * 
 * Main settings page with navigation to various settings sections.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';
import { useProAccess } from '@/features/subscription/hooks';

export default function SettingsScreen() {
    const { hasProAccess } = useProAccess();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Settings' }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <SettingsRow
                        icon="person-outline"
                        title="Profile"
                        onPress={() => router.push('/settings/profile' as any)}
                    />

                    <SettingsRow
                        icon="star"
                        title="Subscription"
                        subtitle={hasProAccess ? 'Mox Pro' : 'Free'}
                        onPress={() => router.push('/settings/subscription' as any)}
                        highlight={!hasProAccess}
                    />
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <SettingsRow
                        icon="notifications-outline"
                        title="Notifications"
                        onPress={() => router.push('/settings/notifications' as any)}
                    />

                    <SettingsRow
                        icon="color-palette-outline"
                        title="Appearance"
                        subtitle="Light"
                        onPress={() => { }}
                    />

                    <SettingsRow
                        icon="time-outline"
                        title="Time & Calendar"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <SettingsRow
                        icon="help-circle-outline"
                        title="Help & FAQ"
                        onPress={() => { }}
                    />

                    <SettingsRow
                        icon="mail-outline"
                        title="Contact Us"
                        onPress={() => { }}
                    />

                    <SettingsRow
                        icon="document-text-outline"
                        title="Privacy Policy"
                        onPress={() => { }}
                    />

                    <SettingsRow
                        icon="document-outline"
                        title="Terms of Service"
                        onPress={() => { }}
                    />
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appInfoText}>Mox v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/**
 * Settings row component
 */
function SettingsRow({
    icon,
    title,
    subtitle,
    onPress,
    highlight,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    highlight?: boolean;
}) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, highlight && styles.iconContainerHighlight]}>
                    <Ionicons
                        name={icon}
                        size={20}
                        color={highlight ? colors.primary : colors.text}
                    />
                </View>
                <View>
                    <Text style={styles.rowTitle}>{title}</Text>
                    {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.m,
    },
    section: {
        marginBottom: spacing.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: typography.caption.color,
        marginBottom: spacing.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.s,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    iconContainerHighlight: {
        backgroundColor: `${colors.primary}15`,
    },
    rowTitle: {
        fontSize: typography.body.fontSize,
        fontWeight: '500',
        color: colors.text,
    },
    rowSubtitle: {
        fontSize: 13,
        color: typography.caption.color,
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    appInfoText: {
        fontSize: 12,
        color: typography.caption.color,
    },
});
