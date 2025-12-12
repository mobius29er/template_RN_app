import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { theme } from '@/lib/theme';
import { initializeRevenueCat, identifyUser } from '@/lib/revenuecat';

const ICON_SIZE = 24;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

/**
 * Tab Bar Icon Component
 */
function TabBarIcon({ 
  name, 
  focused 
}: { 
  name: FeatherIconName; 
  focused: boolean;
}) {
  return (
    <Feather
      name={name}
      size={ICON_SIZE}
      color={focused ? theme.colors.primary : theme.colors.textTertiary}
    />
  );
}

/**
 * Tabs Layout
 * Main navigation for authenticated users
 */
export default function TabsLayout() {
  const { user } = useUser();

  // Initialize RevenueCat when user is available
  useEffect(() => {
    async function setupRevenueCat() {
      try {
        await initializeRevenueCat();
        if (user?.id) {
          await identifyUser(user.id);
        }
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    }

    setupRevenueCat();
  }, [user?.id]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Arc',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Premium',
          headerTitle: 'Premium',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="credit-card" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="user" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border.light,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 60,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
