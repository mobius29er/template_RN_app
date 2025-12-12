import React from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { tokenCache, getClerkPublishableKey } from '@/lib/clerk';
import { theme } from '@/lib/theme';

/**
 * Auth Guard Component
 * Redirects users based on authentication state
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)';

    if (!isSignedIn && inProtectedGroup) {
      // User is not signed in and trying to access protected route
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      // User is signed in but on auth screen
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Root Layout
 * Sets up all providers: Clerk, SafeArea, GestureHandler
 */
export default function RootLayout() {
  const publishableKey = getClerkPublishableKey();

  if (!publishableKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your .env file.'
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ClerkProvider 
          publishableKey={publishableKey} 
          tokenCache={tokenCache}
        >
          <ClerkLoaded>
            <AuthGuard>
              <StatusBar style="auto" />
              <Slot />
            </AuthGuard>
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
