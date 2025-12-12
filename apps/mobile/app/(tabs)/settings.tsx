import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';

/**
 * Settings Screen
 * App preferences and configuration
 */
export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = React.useState(true);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingToggle
              title="Push Notifications"
              description="Receive push notifications"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <View style={styles.separator} />
            <SettingToggle
              title="Dark Mode"
              description="Use dark color theme"
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
            />
            <View style={styles.separator} />
            <SettingToggle
              title="Haptic Feedback"
              description="Vibration on interactions"
              value={hapticFeedbackEnabled}
              onValueChange={setHapticFeedbackEnabled}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingLink
              title="Help Center"
              onPress={() => openLink('https://example.com/help')}
            />
            <View style={styles.separator} />
            <SettingLink
              title="Contact Support"
              onPress={() => openLink('mailto:support@example.com')}
            />
            <View style={styles.separator} />
            <SettingLink
              title="Report a Bug"
              onPress={() => openLink('https://example.com/bug-report')}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <SettingLink
              title="Terms of Service"
              onPress={() => openLink('https://example.com/terms')}
            />
            <View style={styles.separator} />
            <SettingLink
              title="Privacy Policy"
              onPress={() => openLink('https://example.com/privacy')}
            />
            <View style={styles.separator} />
            <SettingLink
              title="Licenses"
              onPress={() => {/* Navigate to licenses */}}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingInfo title="App Version" value="1.0.0" />
            <View style={styles.separator} />
            <SettingInfo title="Build Number" value="1" />
            <View style={styles.separator} />
            <SettingInfo 
              title="Platform" 
              value={Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} 
            />
          </View>
        </View>

        {/* Rate App */}
        <TouchableOpacity 
          style={styles.rateButton}
          onPress={() => {
            // Link to App Store or Play Store
            const storeUrl = Platform.select({
              ios: 'https://apps.apple.com/app/id123456789',
              android: 'https://play.google.com/store/apps/details?id=com.yourcompany.arc',
              default: 'https://example.com',
            });
            openLink(storeUrl);
          }}
        >
          <Text style={styles.rateButtonText}>⭐ Rate Arc</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>Made with ❤️ by Your Company</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingToggleProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingToggle({ title, description, value, onValueChange }: SettingToggleProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: theme.colors.secondary[200], 
          true: theme.colors.primary 
        }}
        thumbColor={value ? '#fff' : theme.colors.secondary[50]}
      />
    </View>
  );
}

interface SettingLinkProps {
  title: string;
  onPress: () => void;
}

function SettingLink({ title, onPress }: SettingLinkProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingArrow}>→</Text>
    </TouchableOpacity>
  );
}

interface SettingInfoProps {
  title: string;
  value: string;
}

function SettingInfo({ title, value }: SettingInfoProps) {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  settingText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textTertiary,
  },
  settingValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  rateButton: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  rateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  footer: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
