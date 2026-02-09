/**
 * ProBadge Component
 * 
 * Small badge to indicate premium features in UI.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useProAccess } from '@/features/subscription/hooks';

interface ProBadgeProps {
    /** Size variant */
    size?: 'small' | 'medium';
    /** If true, tapping badge shows paywall */
    interactive?: boolean;
    /** Show only if user doesn't have pro access */
    hideIfPro?: boolean;
}

/**
 * Pro badge component
 * 
 * @example
 * ```tsx
 * // In a settings row
 * <View style={styles.row}>
 *   <Text>Custom Themes</Text>
 *   <ProBadge hideIfPro />
 * </View>
 * 
 * // Interactive - shows paywall on tap
 * <ProBadge interactive />
 * ```
 */
export function ProBadge({
    size = 'small',
    interactive = false,
    hideIfPro = false,
}: ProBadgeProps) {
    const { hasProAccess, showPaywall } = useProAccess();

    // Hide if user has access and hideIfPro is true
    if (hideIfPro && hasProAccess) {
        return null;
    }

    const content = (
        <View style={[styles.badge, size === 'medium' && styles.badgeMedium]}>
            <Ionicons name="star" size={size === 'small' ? 10 : 12} color="#fff" />
            <Text style={[styles.badgeText, size === 'medium' && styles.badgeTextMedium]}>
                PRO
            </Text>
        </View>
    );

    if (interactive) {
        return (
            <TouchableOpacity onPress={showPaywall}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        gap: 2,
    },
    badgeMedium: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    badgeTextMedium: {
        fontSize: 11,
    },
});
