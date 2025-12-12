# Copilot Instructions for Arc

## Project Overview

Arc is a cross-platform mobile application template built with React Native (Expo), Next.js landing page, and Supabase backend. This monorepo provides a production-ready starting point for building subscription-based mobile apps.

## Copilot Directives (Read First)

When generating or modifying code in this repo:

### Always

- Use TypeScript with explicit types for props, function params, and return values
- Use React Native StyleSheet + `theme` from `@/lib/theme` for all mobile styles
- Use Tailwind CSS for web app styling
- Ensure code works on Web, iOS, and Android; avoid platform-specific APIs that won't run everywhere
- Use existing context + hooks patterns for shared state (auth, subscriptions)
- Follow Expo Router file-based navigation conventions

### Never

- Hardcode user-facing strings directly in components
- Introduce new dependencies without following existing patterns
- Call external APIs (OpenAI, ElevenLabs) directly from the client or expose API keys
- Bypass authentication or Supabase Row Level Security
- Mix styling approaches (don't use inline styles or styled-components)

If in doubt, copy existing patterns from similar files in `apps/mobile/app/`, `apps/web/components/`, or `supabase/functions/`.

## Technology Stack

### Mobile App (`apps/mobile/`)

- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **Styling**: React Native StyleSheet with custom theme (`lib/theme.ts`)
- **Authentication**: Clerk with `expo-secure-store` token caching
- **Payments**: RevenueCat for in-app subscriptions
- **Database**: Supabase client for data operations

### Web App (`apps/web/`)

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Server and Client components (React Server Components by default)

### Backend (`supabase/`)

- **Database**: PostgreSQL with Row Level Security
- **Edge Functions**: Deno-based serverless functions
- **AI Integration**: OpenAI GPT-4, ElevenLabs TTS (via Edge Functions)

### Build & Deploy

- **Monorepo**: Turborepo with npm workspaces
- **Mobile Builds**: EAS Build (development, preview, production profiles)
- **Web Deploy**: Vercel (recommended)

## Project Structure

```
arc/
├── apps/
│   ├── mobile/              # React Native (Expo) app
│   │   ├── app/             # Expo Router screens
│   │   │   ├── (auth)/      # Authentication screens
│   │   │   └── (tabs)/      # Main tab screens
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities and configurations
│   │   └── types/           # TypeScript definitions
│   └── web/                 # Next.js landing page
│       ├── app/             # App Router pages
│       └── components/      # Landing page components
├── supabase/
│   ├── functions/           # Edge Functions (Deno)
│   └── migrations/          # Database migrations
└── docs/                    # Documentation
```

## Coding Conventions

### TypeScript

- Use strict TypeScript mode
- Define explicit types for all function parameters and return values
- Export types from `types/` directory for reusability
- Use interfaces for object shapes, types for unions and primitives
- Prefer `const` over `let`, never use `var`

### React Native Components

- Use functional components with TypeScript interfaces for props
- Name component files with PascalCase (e.g., `Button.tsx`, `Paywall.tsx`)
- Define prop interfaces at the top of the file
- Use the pattern: `export const ComponentName: React.FC<Props> = ({ ... }) => { ... }`

### Mobile Styling

```typescript
import { theme } from '@/lib/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  text: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
});
```

### Web Styling (Tailwind)

```tsx
// Use Tailwind utility classes
<div className="bg-gray-900 px-4 py-2 rounded-lg">
  <p className="text-white text-lg">Content</p>
</div>
```

### File Naming

- Components: PascalCase (e.g., `Paywall.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSubscription.ts`)
- Utilities: camelCase (e.g., `api.ts`)
- Types: camelCase (e.g., `index.ts`)

### Import Aliases

- Mobile: Use `@/` alias for absolute imports from `apps/mobile/`
- Web: Use relative imports or configure aliases in `tsconfig.json`

## Key Patterns

### Clerk Authentication (Mobile)

```typescript
import { useAuth, useUser } from '@clerk/clerk-expo';

const { isLoaded, isSignedIn } = useAuth();
const { user } = useUser();

// Token caching with SecureStore
import { tokenCache } from '@/lib/clerk';
```

### RevenueCat Subscriptions (Mobile)

```typescript
import { 
  initializeRevenueCat, 
  getOfferings, 
  purchasePackage,
  checkEntitlement 
} from '@/lib/revenuecat';

// Check subscription status
const isPremium = await checkEntitlement('premium');

// Get available packages
const offerings = await getOfferings();

// Make purchase
const result = await purchasePackage(offerings.current.availablePackages[0]);
```

### Supabase Client (Mobile)

```typescript
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';

// For authenticated requests
const authClient = await createAuthenticatedSupabaseClient(getToken);
const { data, error } = await authClient
  .from('profiles')
  .select('*')
  .single();
```

### Edge Functions (Supabase)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, createErrorResponse, createSuccessResponse } from '../_shared/utils.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();
    // Process request
    return createSuccessResponse({ result });
  } catch (error) {
    return createErrorResponse(error.message, 500);
  }
});
```

## AI Integration Rules

- All OpenAI and ElevenLabs calls MUST go through Supabase Edge Functions
- Never call AI APIs directly from the client or expose API keys
- Edge Functions should:
  - Validate and sanitize all incoming input
  - Enforce authentication/authorization checks
  - Log errors safely (no sensitive content in logs)
- The client should only receive:
  - Final processed text/data
  - Storage paths/URLs to generated assets

## State Management & Navigation

### Mobile

- Use React Context + custom hooks for shared state
- Do not add Redux, Zustand, or other state libraries
- Navigation:
  - Use Expo Router file-based routing under `app/`
  - For new tab screens, add them under `app/(tabs)/`
  - Use `useRouter` and `useLocalSearchParams` from Expo Router

### Web

- Use React Server Components by default
- Add `'use client'` directive only when client-side interactivity is needed
- Use Next.js App Router conventions

## Cross-Platform Requirements

**Functionality must work on Web, iOS, and Android.** This is non-negotiable:

- Test on all platforms before completing features
- Use `Platform.OS` for platform-specific code when necessary
- Ensure responsive design adapts to different screen sizes
- Verify all Expo/React Native APIs are supported on all platforms

### Platform Testing Checklist

- [ ] Web browser (Chrome, Safari, Firefox)
- [ ] iOS Simulator or device
- [ ] Android Emulator or device

## Security Considerations

- Never commit secrets or API keys to the repository
- Use environment variables for sensitive configuration
- Validate user input on both client and server
- Follow Supabase Row Level Security (RLS) policies
- Ensure proper authentication checks in Edge Functions

## Development Commands

```bash
# Root (monorepo)
npm install              # Install all dependencies
npm run dev              # Start all apps in development

# Mobile
cd apps/mobile
npm start                # Start Expo dev server
npm run ios              # Run on iOS
npm run android          # Run on Android

# Web
cd apps/web
npm run dev              # Start Next.js dev server
npm run build            # Build for production

# Supabase
supabase start           # Start local Supabase
supabase functions serve # Serve Edge Functions locally
supabase db push         # Apply migrations
supabase functions deploy # Deploy Edge Functions
```

## EAS Build Commands

```bash
cd apps/mobile

# Development build (includes dev client)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```
