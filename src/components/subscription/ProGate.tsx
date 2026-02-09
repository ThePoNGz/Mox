/**
 * ProGate Component
 * 
 * Wraps premium features and shows paywall when accessed by free users.
 * Use this to gate features that require Mox Pro.
 */

import React, { useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';
import { useProAccess } from '@/features/subscription/hooks';

interface ProGateProps {
    /** Content to show when user has pro access */
    children: ReactNode;
    /** Content to show when user doesn't have pro access (fallback) */
    fallback?: ReactNode;
    /** Feature name to display in the upgrade prompt */
    featureName?: string;
    /** If true, show children but overlay with upgrade prompt */
    overlay?: boolean;
}

/**
 * Gate component for premium features
 * 
 * @example
 * ```tsx
 * // Block access completely
 * <ProGate featureName="AI Suggestions">
 *   <AISuggestionList />
 * </ProGate>
 * 
 * // Show custom fallback
 * <ProGate fallback={<FreeVersionComponent />}>
 *   <ProVersionComponent />
 * </ProGate>
 * 
 * // Overlay mode - shows blurred content with upgrade prompt
 * <ProGate overlay featureName="Custom Themes">
 *   <ThemeSelector />
 * </ProGate>
 * ```
 */
export function ProGate({
    children,
    fallback,
    featureName = 'this feature',
    overlay = false,
}: ProGateProps) {
    const { hasProAccess, showPaywall, isLoading } = useProAccess();

    const handleUpgrade = useCallback(async () => {
        await showPaywall();
    }, [showPaywall]);

    // Loading state
    if (isLoading) {
        return null;
    }

    // User has access - show children
    if (hasProAccess) {
        return <>{children}</>;
    }

    // Overlay mode - show content with overlay
    if (overlay) {
        return (
            <View style={styles.overlayContainer}>
                <View style={styles.blurredContent}>{children}</View>
                <View style={styles.overlay}>
                    <UpgradePrompt
                        featureName={featureName}
                        onUpgrade={handleUpgrade}
                    />
                </View>
            </View>
        );
    }

    // Custom fallback provided
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default upgrade prompt
    return <UpgradePrompt featureName={featureName} onUpgrade={handleUpgrade} />;
}

/**
 * Upgrade prompt UI
 */
function UpgradePrompt({
    featureName,
    onUpgrade,
}: {
    featureName: string;
    onUpgrade: () => void;
}) {
    return (
        <View style={styles.promptContainer}>
            <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={24} color={colors.primary} />
            </View>
            <Text style={styles.promptTitle}>Upgrade to Mox Pro</Text>
            <Text style={styles.promptDescription}>
                Get access to {featureName} and more premium features.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
                <Ionicons name="star" size={16} color="#fff" />
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'relative',
    },
    blurredContent: {
        opacity: 0.3,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    promptContainer: {
        alignItems: 'center',
        padding: spacing.l,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    promptTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.s,
    },
    promptDescription: {
        fontSize: typography.body.fontSize,
        color: typography.caption.color,
        textAlign: 'center',
        marginBottom: spacing.l,
        maxWidth: 280,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.s + 4,
        paddingHorizontal: spacing.l,
        borderRadius: 12,
        gap: spacing.s,
    },
    upgradeButtonText: {
        color: '#fff',
        fontSize: typography.body.fontSize,
        fontWeight: '600',
    },
});
