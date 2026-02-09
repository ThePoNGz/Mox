/**
 * Subscription Settings Screen
 * 
 * Displays current subscription status and provides actions:
 * - View current plan and expiration
 * - Upgrade (present paywall)
 * - Manage subscription (customer center)
 * - Restore purchases
 */

import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';
import { useSubscription } from '@/features/subscription/hooks';
import { formatExpirationDate, getStatusDisplayText } from '@/features/subscription/utils';

export default function SubscriptionScreen() {
    const {
        hasProAccess,
        status,
        planId,
        expiresAt,
        isLoading,
        presentPaywall,
        presentCustomerCenter,
        restorePurchases,
        refresh,
    } = useSubscription();

    const [isRestoring, setIsRestoring] = useState(false);

    const handleUpgrade = useCallback(async () => {
        await presentPaywall();
    }, [presentPaywall]);

    const handleManageSubscription = useCallback(async () => {
        await presentCustomerCenter();
    }, [presentCustomerCenter]);

    const handleRestore = useCallback(async () => {
        setIsRestoring(true);
        try {
            const restored = await restorePurchases();
            if (restored) {
                Alert.alert('Success', 'Your purchases have been restored!');
            } else {
                Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore purchases. Please try again.');
        } finally {
            setIsRestoring(false);
        }
    }, [restorePurchases]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Subscription' }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading subscription info...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Subscription' }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Current Plan Card */}
                <View style={styles.planCard}>
                    <View style={styles.planHeader}>
                        <Ionicons
                            name={hasProAccess ? 'star' : 'star-outline'}
                            size={32}
                            color={hasProAccess ? colors.primary : colors.text}
                        />
                        <View style={styles.planInfo}>
                            <Text style={styles.planTitle}>
                                {hasProAccess ? 'Mox Pro' : 'Free Plan'}
                            </Text>
                            <Text style={styles.planStatus}>
                                {getStatusDisplayText(status)}
                            </Text>
                        </View>
                    </View>

                    {hasProAccess && (
                        <View style={styles.planDetails}>
                            {planId && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Plan</Text>
                                    <Text style={styles.detailValue}>
                                        {planId.charAt(0).toUpperCase() + planId.slice(1)}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    {status === 'canceled' ? 'Access until' : 'Renews'}
                                </Text>
                                <Text style={styles.detailValue}>
                                    {formatExpirationDate(expiresAt)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Pro Features */}
                <View style={styles.featuresCard}>
                    <Text style={styles.featuresTitle}>Mox Pro Features</Text>
                    <View style={styles.featureList}>
                        <FeatureItem
                            icon="flash"
                            text="AI-powered scheduling"
                            available={hasProAccess}
                        />
                        <FeatureItem
                            icon="infinite"
                            text="Unlimited tasks & events"
                            available={hasProAccess}
                        />
                        <FeatureItem
                            icon="sync"
                            text="Cross-device sync"
                            available={hasProAccess}
                        />
                        <FeatureItem
                            icon="color-palette"
                            text="Custom themes"
                            available={hasProAccess}
                        />
                        <FeatureItem
                            icon="shield-checkmark"
                            text="Priority support"
                            available={hasProAccess}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {!hasProAccess && (
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleUpgrade}
                        >
                            <Ionicons name="star" size={20} color="#fff" />
                            <Text style={styles.primaryButtonText}>Upgrade to Pro</Text>
                        </TouchableOpacity>
                    )}

                    {hasProAccess && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleManageSubscription}
                        >
                            <Ionicons name="settings-outline" size={20} color={colors.primary} />
                            <Text style={styles.secondaryButtonText}>Manage Subscription</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleRestore}
                        disabled={isRestoring}
                    >
                        {isRestoring ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <>
                                <Ionicons name="refresh" size={20} color={colors.primary} />
                                <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text style={styles.terms}>
                    Subscription automatically renews unless cancelled at least 24 hours before
                    the end of the current period. Manage your subscription in Settings after
                    purchase.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

/**
 * Feature item component
 */
function FeatureItem({
    icon,
    text,
    available,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    available: boolean;
}) {
    return (
        <View style={styles.featureItem}>
            <Ionicons
                name={available ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={available ? colors.success : colors.border}
            />
            <Text style={[styles.featureText, !available && styles.featureTextDisabled]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.m,
        color: typography.caption.color,
        fontSize: typography.body.fontSize,
    },
    content: {
        padding: spacing.m,
    },
    planCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: spacing.l,
        marginBottom: spacing.m,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planInfo: {
        marginLeft: spacing.m,
    },
    planTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    planStatus: {
        fontSize: 14,
        color: colors.primary,
        marginTop: spacing.xs,
    },
    planDetails: {
        marginTop: spacing.m,
        paddingTop: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    detailLabel: {
        color: typography.caption.color,
        fontSize: typography.body.fontSize,
    },
    detailValue: {
        fontWeight: '600',
        color: colors.text,
        fontSize: typography.body.fontSize,
    },
    featuresCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: spacing.l,
        marginBottom: spacing.m,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.m,
    },
    featureList: {
        gap: spacing.s,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureText: {
        marginLeft: spacing.s,
        fontSize: typography.body.fontSize,
        color: colors.text,
    },
    featureTextDisabled: {
        color: typography.caption.color,
    },
    actions: {
        gap: spacing.s,
        marginBottom: spacing.l,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.m,
        borderRadius: 12,
        gap: spacing.s,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: typography.body.fontSize,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: typography.body.fontSize,
        fontWeight: '600',
    },
    terms: {
        fontSize: 12,
        color: typography.caption.color,
        textAlign: 'center',
        lineHeight: 18,
    },
});
