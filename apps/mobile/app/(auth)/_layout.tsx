import { Stack } from 'expo-router';
import { theme } from '@/lib/theme';

/**
 * Auth Group Layout
 * Contains sign-in, sign-up, and other auth-related screens
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
