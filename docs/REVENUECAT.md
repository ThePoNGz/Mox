# RevenueCat Integration - Mox App

This document describes how RevenueCat is integrated into the Mox app for subscription management.

## Overview

The integration follows the tech stack guidelines:
- **Native**: RevenueCat SDK via `react-native-purchases` and `react-native-purchases-ui`
- **Web**: Will use Stripe Checkout (Phase 3)
- **Server**: Supabase Edge Functions for webhook handling
- **Entitlements**: Server-synced via database (client never decides premium)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (RN App)                          │
│  ┌─────────────────┐    ┌────────────────┐    ┌──────────────┐ │
│  │  @/lib/         │    │  @/features/   │    │ Components   │ │
│  │  entitlements   │◄──►│  subscription  │◄──►│ ProGate      │ │
│  │  (adapter)      │    │  (hooks)       │    │ ProBadge     │ │
│  └────────┬────────┘    └────────────────┘    └──────────────┘ │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              RevenueCat SDK (react-native-purchases)        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RevenueCat Backend                           │
│  - Manages subscriptions                                         │
│  - Handles store receipts                                        │
│  - Sends webhooks                                                │
└───────────────────────────────┬─────────────────────────────────┘
                               │ Webhook
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               Supabase Edge Function (revenuecat-webhook)       │
│  - Verifies webhook signature                                   │
│  - Updates entitlements table                                   │
└───────────────────────────────┬─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                            │
│  entitlements table:                                            │
│  - user_id (PK, references auth.users)                         │
│  - status (active|trial|canceled|expired)                      │
│  - plan_id                                                      │
│  - expires_at                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Setup

### 1. Environment Variables

Create a `.env` file with:

```bash
# RevenueCat API Key (get from RevenueCat dashboard)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_api_key_here
```

### 2. Supabase Secrets

Set the webhook secret for Edge Functions:

```bash
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_webhook_secret
```

### 3. RevenueCat Dashboard Configuration

1. **Create Entitlement**: Create "Mox Pro" entitlement
2. **Create Products**: 
   - `monthly` - Monthly subscription
   - `yearly` - Yearly subscription  
   - `weekly` - Weekly subscription
   - `lifetime` - Lifetime purchase
3. **Create Offering**: Add products to "default" offering
4. **Configure Paywall**: Design paywall in RevenueCat dashboard
5. **Set up Webhook**:
   - URL: `https://your-project.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization: Set your REVENUECAT_WEBHOOK_SECRET
   - Events: All subscription events

## Usage

### Check Pro Access

```tsx
import { useProAccess } from '@/features/subscription/hooks';

function MyComponent() {
    const { hasProAccess, requireProAccess, showPaywall } = useProAccess();

    const handlePremiumFeature = async () => {
        // Method 1: Check and show paywall if needed
        const hasAccess = await requireProAccess();
        if (hasAccess) {
            // Do premium thing
        }

        // Method 2: Just show paywall
        await showPaywall();
    };
}
```

### Full Subscription State

```tsx
import { useSubscription } from '@/features/subscription/hooks';

function SubscriptionScreen() {
    const {
        hasProAccess,
        status,
        planId,
        expiresAt,
        isLoading,
        presentPaywall,
        presentCustomerCenter,
        restorePurchases,
    } = useSubscription();

    // Use these values and actions
}
```

### Gate Features with ProGate

```tsx
import { ProGate } from '@/components/subscription';

// Block completely
<ProGate featureName="AI Suggestions">
    <PremiumFeature />
</ProGate>

// Show custom fallback
<ProGate fallback={<FreeVersion />}>
    <ProVersion />
</ProGate>

// Overlay mode
<ProGate overlay featureName="Analytics">
    <AnalyticsDashboard />
</ProGate>
```

### Show Pro Badge

```tsx
import { ProBadge } from '@/components/subscription';

// Small badge (hides if user has pro)
<ProBadge hideIfPro />

// Interactive (shows paywall on tap)
<ProBadge interactive />
```

### Database Entitlements (Server Source of Truth)

```tsx
import { useEntitlementFromDB } from '@/features/subscription/hooks';

function MyComponent({ userId }: { userId: string }) {
    const { 
        hasActiveEntitlement, 
        status, 
        entitlement 
    } = useEntitlementFromDB(userId);

    // This is synced from RevenueCat via webhooks
    // Use for server-side feature decisions
}
```

## Files

### Client

| Path | Description |
|------|-------------|
| `src/lib/config/index.ts` | RevenueCat API key and entitlement IDs |
| `src/lib/entitlements/` | Platform adapters (native, web, stub) |
| `src/features/subscription/` | Hooks, types, utils for subscription |
| `src/components/subscription/` | ProGate, ProBadge components |
| `src/app/(tabs)/settings/subscription.tsx` | Subscription settings screen |

### Server

| Path | Description |
|------|-------------|
| `supabase/functions/revenuecat-webhook/index.ts` | Webhook handler |
| `supabase/functions/_shared/verifyRevenueCat.ts` | Webhook verification |
| `supabase/functions/_shared/db.ts` | Database utilities |
| `supabase/migrations/0000_initial_schema.sql` | Entitlements table |

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `INITIAL_PURCHASE` | Set status to `active` |
| `RENEWAL` | Set status to `active` |
| `CANCELLATION` | Set status to `canceled` |
| `EXPIRATION` | Set status to `expired` |
| `UNCANCELLATION` | Set status to `active` |
| `NON_RENEWING_PURCHASE` | Set status to `active` (lifetime) |
| `BILLING_ISSUE` | Set status to `canceled` |
| `SUBSCRIPTION_EXTENDED` | Set status to `active` |

## Testing

### Sandbox Testing

1. Use RevenueCat sandbox API key for development
2. Create sandbox users in App Store Connect / Google Play Console
3. Test purchases using sandbox accounts

### Webhook Testing

1. Use RevenueCat dashboard to send test webhooks
2. Check Supabase Edge Function logs for processing
3. Verify entitlements table is updated correctly

## Security

- **Client**: Never trusts client for premium status
- **Webhook**: Verified using shared secret in Authorization header
- **Database**: RLS policies ensure users can only read their own entitlements
- **Service Role**: Only Edge Functions with service role can update entitlements

## Deployment

1. Deploy Edge Functions:
   ```bash
   supabase functions deploy revenuecat-webhook
   ```

2. Set secrets:
   ```bash
   supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_secret
   ```

3. Configure RevenueCat webhook URL in dashboard

4. Build app with EAS:
   ```bash
   eas build --platform all
   ```
