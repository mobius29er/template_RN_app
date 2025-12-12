# Arc - React Native Monorepo Template

A production-ready monorepo template for building cross-platform mobile applications with React Native (Expo), Next.js web landing page, and Supabase backend.

## ⚡ Quickstart Guide (5 Minutes)

Get up and running quickly with this template:

### Step 1: Use This Template

```bash
# Option A: Use GitHub's "Use this template" button (recommended)
# Click the green "Use this template" button on GitHub

# Option B: Clone directly
git clone https://github.com/mobius29er/template_RN_app.git my-app
cd my-app
rm -rf .git && git init  # Start fresh git history
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example apps/mobile/.env
cp .env.example apps/web/.env.local
```

Then edit the `.env` files with your API keys (see [Service Configuration](#4-service-configuration) below).

### Step 4: Update App Identity

Edit `apps/mobile/app.json`:
- Change `"name"` to your app name
- Change `"slug"` to your app slug  
- Change `"bundleIdentifier"` (iOS) and `"package"` (Android) to your bundle ID

### Step 5: Run the Apps

```bash
# Terminal 1: Start mobile app
cd apps/mobile
npm start

# Terminal 2: Start web landing page
cd apps/web
npm run dev
```

### Step 6: Start Building!

- **Mobile screens**: `apps/mobile/app/`
- **Mobile components**: `apps/mobile/components/`
- **Landing page**: `apps/web/components/`
- **Database**: `supabase/migrations/`
- **API functions**: `supabase/functions/`

> **Note**: RevenueCat requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) - it won't work in Expo Go. Run `eas build --profile development` to create one.

---

## 🏗️ Architecture

```
arc/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   │   ├── app/         # Expo Router screens
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utilities (theme, supabase, clerk, revenuecat)
│   │   └── types/       # TypeScript type definitions
│   └── web/             # Next.js landing page
│       ├── app/         # Next.js App Router
│       └── components/  # Landing page components
├── supabase/
│   ├── functions/       # Edge Functions (Deno)
│   │   ├── ai-generate/         # OpenAI text generation
│   │   ├── text-to-speech/      # ElevenLabs TTS
│   │   ├── news/                # News API integration
│   │   ├── social-media/        # Social media framework
│   │   └── revenuecat-webhook/  # RevenueCat webhook handler
│   └── migrations/      # Database migrations
└── docs/                # Documentation
```

## 🚀 Features

### Mobile App (Expo)
- **Expo SDK 54** with TypeScript
- **Expo Router** for file-based navigation
- **Clerk** authentication (email, Google, Apple)
- **RevenueCat** for in-app subscriptions
- **Supabase** for database and storage
- Pre-built screens: Auth, Home, Profile, Settings, Subscriptions
- Modular **Paywall** component

### Web Landing Page (Next.js)
- **Next.js 15** with App Router
- **Tailwind CSS** for styling
- Responsive design
- SEO optimized
- Components: Hero, Features, Mascot, Pricing, Waitlist, Footer

### Backend (Supabase)
- **PostgreSQL** database with RLS
- **Edge Functions** for serverless APIs
- Pre-built integrations:
  - OpenAI (GPT-4) text generation
  - ElevenLabs text-to-speech
  - RevenueCat webhook handler
  - News API framework
  - Social media framework

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: `npm install -g expo-cli`
- **Supabase CLI**: `npm install -g supabase`
- **iOS/Android**: Xcode (Mac) / Android Studio

## 🔧 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/arc.git
cd arc
npm install
```

### 2. Environment Configuration

Create `.env` files for each app:

**Mobile App** (`apps/mobile/.env`):
```env
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxx
```

**Web App** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

**Supabase Edge Functions** (set via Supabase Dashboard or CLI):
```env
OPENAI_API_KEY=sk-xxx
ELEVENLABS_API_KEY=xxx
NEWS_API_KEY=xxx
REVENUECAT_WEBHOOK_SECRET=xxx
```

### 3. Bundle Identifiers

**⚠️ IMPORTANT**: Replace bundle identifiers before building:

1. **`app.json`** (`apps/mobile/app.json`):
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.arc"
       },
       "android": {
         "package": "com.yourcompany.arc"
       }
     }
   }
   ```

2. **`eas.json`** (`apps/mobile/eas.json`):
   - Update build profiles as needed

3. **App Store Connect** (iOS):
   - Create app with matching bundle ID
   - Configure App Store Connect API key in EAS

4. **Google Play Console** (Android):
   - Create app with matching package name
   - Upload keystore to EAS secrets

### 4. Service Configuration

#### Clerk Authentication
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Enable authentication methods (Email, Google, Apple)
4. Copy publishable key to `.env`
5. Configure OAuth providers in Clerk dashboard

#### RevenueCat Subscriptions
1. Create account at [revenuecat.com](https://revenuecat.com)
2. Create new project
3. Connect App Store & Play Store
4. Create products and offerings
5. Copy API keys to `.env`
6. Set up webhook: `https://xxx.supabase.co/functions/v1/revenuecat-webhook`

#### Supabase Backend
1. Create project at [supabase.com](https://supabase.com)
2. Run migrations:
   ```bash
   cd supabase
   supabase db push
   ```
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy
   ```
4. Set environment variables in dashboard

## 📱 Development

### Start Mobile App
```bash
cd apps/mobile
npm start           # Start Expo dev server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run on web browser
```

### Start Web Landing Page
```bash
cd apps/web
npm run dev         # Start Next.js dev server
```

### Start Supabase Locally
```bash
supabase start      # Start local Supabase
supabase functions serve  # Start Edge Functions locally
```

## 🏭 Building for Production

### Mobile App (EAS Build)
```bash
cd apps/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Web Landing Page
```bash
cd apps/web
npm run build       # Build for production
npm run start       # Start production server
```

### Deploy to Vercel
```bash
# From web directory
npx vercel
```

## 📁 Project Structure Details

### Mobile App (`apps/mobile/`)

```
app/
├── _layout.tsx           # Root layout with auth state
├── index.tsx             # Welcome/onboarding screen
├── (auth)/               # Auth screens group
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   └── sign-up.tsx
└── (tabs)/               # Main app tabs
    ├── _layout.tsx
    ├── index.tsx         # Home screen
    ├── subscription.tsx  # Subscription screen
    ├── profile.tsx       # Profile screen
    └── settings.tsx      # Settings screen

lib/
├── theme.ts              # Design tokens and theme
├── supabase.ts           # Supabase client
├── clerk.ts              # Clerk utilities
├── revenuecat.ts         # RevenueCat utilities
├── api.ts                # API client for external services
└── index.ts              # Central exports

components/
├── Paywall.tsx           # Modular paywall modal
└── index.ts              # Component exports

types/
└── index.ts              # TypeScript type definitions
```

### Web App (`apps/web/`)

```
app/
├── layout.tsx            # Root layout with metadata
├── page.tsx              # Landing page
├── globals.css           # Global styles
└── api/
    └── waitlist/route.ts # Waitlist API endpoint

components/
├── Navbar.tsx
├── Hero.tsx
├── Features.tsx
├── Mascot.tsx
├── Pricing.tsx
├── Waitlist.tsx
├── Footer.tsx
└── index.ts              # Component exports
```

### Supabase (`supabase/`)

```
functions/
├── _shared/utils.ts      # Shared utilities
├── ai-generate/          # OpenAI integration
├── text-to-speech/       # ElevenLabs integration
├── news/                 # News API framework
├── social-media/         # Social media framework
└── revenuecat-webhook/   # Subscription webhooks

migrations/
└── 20240101000000_initial_schema.sql
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` templates
2. **Enable RLS** on all Supabase tables
3. **Validate all inputs** in Edge Functions
4. **Use HTTPS** everywhere
5. **Rotate API keys** regularly
6. **Store sensitive keys** in EAS secrets (mobile) or Vercel env vars (web)

## 🧪 Testing

```bash
# Mobile
cd apps/mobile
npm test

# Web
cd apps/web
npm test
```

## 📖 Documentation

- [Expo Documentation](https://docs.expo.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [RevenueCat Documentation](https://docs.revenuecat.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev) for the amazing mobile development platform
- [Clerk](https://clerk.com) for authentication
- [RevenueCat](https://revenuecat.com) for subscription management
- [Supabase](https://supabase.com) for the backend infrastructure

---

Built with ❤️ using this template
