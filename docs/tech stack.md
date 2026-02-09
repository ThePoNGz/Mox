
```
# Schedule Productivity App — Architecture Spec (Locked)

This document is the single source of truth for stack, boundaries, and structure.  
Planner agents must follow it exactly. No deviations without explicit approval.

---

## 1) Stack (Locked — no substitutions)

**Core**
- Expo SDK 52 (pinned), React Native (SDK 52), TypeScript strict
- Expo Router (SDK‑compatible), EAS Build/Submit/Update day‑1
- `app.config.ts` (no `app.json`)
- Path alias: `@/* → ./src/*`

**Backend**
- Supabase hosted: Postgres + RLS + Auth + Storage + Edge Functions (Deno)
- Supabase CLI for local dev, migrations, type generation

**Server state**
- TanStack Query v5; all DB reads/writes via hooks in `src/features/*/hooks`
- Query keys defined in `src/features/*/keys.ts`

**UI state**
- Zustand for UI‑only state (modals/toggles); never DB data

**Local storage (non‑sensitive)**
- Adapter `@/lib/storage`
  - native: `react-native-mmkv`
  - web: `localStorage`
- App code never imports MMKV directly

**Secure storage (auth/session)**
- Adapter `@/lib/secureStorage`
  - native: `expo-secure-store`
  - web: stub
- Supabase Auth persistence must use `secureStorage`

**Date/time**
- `date-fns` + `date-fns-tz` via `@/lib/datetime`

**Forms**
- `react-hook-form` + `zod`

**Monetization**
- RevenueCat (native) + Stripe Checkout (web, Phase 3) via `@/lib/entitlements`
- RevenueCat `appUserID === supabase.auth.user.id` (UUID)
- Feature gating reads server‑synced DB entitlements only

**AI**
- DeepSeek (or any model) via Supabase Edge Functions only
- Log: model/version/latency/userId/tokens; redact content; retention policy

**Analytics**
- PostHog via `@/lib/analytics`

**Crash**
- Sentry via `@/lib/sentry`

**Notifications**
- `expo-notifications` via `@/lib/notifications`

**UI**
- `@expo/vector-icons`
- `react-native-reanimated` + `react-native-gesture-handler` (from SDK 52)
- Styling: `StyleSheet` + `@/theme`; no Tailwind/NativeWind

**Testing**
- Jest + React Native Testing Library (no Detox)

---

## 2) Boundaries (Non‑Negotiable)

1. No direct platform SDK imports outside `src/lib/**`.
2. Platform branching via `.native.ts` / `.web.ts`.  
   `Platform.OS` allowed only in `src/lib/**` and `src/components/ui/**`.
3. Server state only via TanStack Query hooks in `features/`.
4. UI‑only state in Zustand (never DB data).
5. DB timestamps are UTC (`timestamptz`); conversion only in `@/lib/datetime`.
6. DB change requires: migration SQL + RLS update + `supabase gen types`.
7. Edge Functions only for AI + webhooks + cron (not hot‑path reads).
8. Entitlements are server‑synced; client never decides premium.
9. Env vars only via `@/lib/config`; client uses `EXPO_PUBLIC_*`.
10. V1 online‑first; no offline mutation queue.
11. Deep links: `scheduleapp://` + `https://yourapp.com/app/` in `app.config.ts`.
12. Expo SDK pinned; no deps requiring SDK 53+.
13. No new dependencies without explicit approval.

---

## 3) Folder Structure (must exist from commit 1)

```
src/
  lib/
    config/
      index.ts
    supabase/
      client.ts
      types.ts
      index.ts
    storage/
      storage.ts
      storage.native.ts
      storage.web.ts
      index.ts
    secureStorage/
      secureStorage.ts
      secureStorage.native.ts
      secureStorage.web.ts
      index.ts
    entitlements/
      entitlements.ts
      entitlements.native.ts
      entitlements.web.ts
      index.ts
    notifications/
      notifications.ts
      notifications.native.ts
      notifications.web.ts
      index.ts
    analytics/
      analytics.ts
      analytics.native.ts
      analytics.web.ts
      index.ts
    sentry/
      sentry.ts
      sentry.native.ts
      sentry.web.ts
      index.ts
    datetime/
      index.ts

  theme/
    colors.ts
    spacing.ts
    typography.ts
    index.ts

  components/
    ui/
    common/
    schedule/
    tasks/

  features/
    schedule/
      hooks/
      keys.ts
      types.ts
      utils.ts
    tasks/
      hooks/
      keys.ts
      types.ts
      utils.ts
    ai/
      hooks/
      keys.ts
      types.ts
    settings/
      hooks/
      keys.ts
      types.ts

  hooks/
  stores/
  constants/
  utils/

app/
  _layout.tsx
  index.tsx
  +not-found.tsx

  (auth)/
    _layout.tsx
    login.tsx
    signup.tsx
    forgot-password.tsx
    confirm.tsx

  (tabs)/
    _layout.tsx
    schedule/
      index.tsx
      [eventId].tsx
      create.tsx
    tasks/
      index.tsx
      [taskId].tsx
      create.tsx
    ai/
      index.tsx
    settings/
      index.tsx
      profile.tsx
      subscription.tsx
      notifications.tsx

supabase/
  config.toml
  seed.sql
  migrations/
  functions/
    _shared/
      config.ts
      db.ts
      verifyRevenueCat.ts
      verifyStripe.ts
      logger.ts
    ai-suggest/
      index.ts
    revenuecat-webhook/
      index.ts
    stripe-webhook/
      index.ts
```

---

## 4) Supabase Client Template (required)

```ts
// src/lib/supabase/client.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { secureStorage } from "@/lib/secureStorage";
import type { Database } from "./types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: secureStorage,
  },
});
```

---

## 5) Why this structure

- `src/lib/` is a **firewall**: platform SDKs are isolated, so iOS/web ports only touch adapters.
- `.native.ts` / `.web.ts` allows **automatic platform dispatch** with no business‑logic branching.
- `features/` owns data + business logic; `components/` renders; `app/` wires routes.  
  This separation prevents platform ports from rewriting core logic.
- Supabase code is centralized and typed; auth persistence changes only touch one file.
- Same backend for all clients; web becomes “just another client”.

---

## 6) Notes for planner agents

- Do not implement web or iOS now.  
- Do implement web‑safe adapters and platform suffix files from day 1.  
- All code must respect the boundaries above.
```