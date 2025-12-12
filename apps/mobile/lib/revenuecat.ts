/**
 * RevenueCat Configuration
 * 
 * This module sets up RevenueCat for in-app purchases and subscriptions.
 * 
 * IMPORTANT: RevenueCat requires a development build. It will NOT work in Expo Go.
 * Run `npm run build:dev` to create a development build first.
 * 
 * @see https://www.revenuecat.com/docs/getting-started/installation/reactnative
 */

import { Platform } from 'react-native';
import Purchases, {
  PurchasesConfiguration,
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

// Re-export types for convenience
export type { CustomerInfo, PurchasesOffering, PurchasesPackage };

/**
 * Get the appropriate RevenueCat API key for the current platform.
 */
const getRevenueCatApiKey = (): string => {
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

  if (Platform.OS === 'ios') {
    if (!iosKey) {
      throw new Error(
        'Missing EXPO_PUBLIC_REVENUECAT_IOS_KEY. ' +
        'Please add it to your .env.local file. ' +
        'Get it from https://app.revenuecat.com'
      );
    }
    return iosKey;
  }

  if (Platform.OS === 'android') {
    if (!androidKey) {
      throw new Error(
        'Missing EXPO_PUBLIC_REVENUECAT_ANDROID_KEY. ' +
        'Please add it to your .env.local file. ' +
        'Get it from https://app.revenuecat.com'
      );
    }
    return androidKey;
  }

  // Web is not supported by RevenueCat
  throw new Error('RevenueCat is not supported on web. Use a native build.');
};

/**
 * Initialize RevenueCat SDK.
 * Call this once when the app starts (usually in the root layout).
 * 
 * @param userId - Optional user ID to identify the user. 
 *                 If not provided, RevenueCat will generate an anonymous ID.
 *                 Pass the Clerk user ID to link purchases to your user.
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  // Skip on web
  if (Platform.OS === 'web') {
    console.log('RevenueCat: Skipping initialization on web');
    return;
  }

  try {
    const apiKey = getRevenueCatApiKey();

    // Enable debug logging in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    const config: PurchasesConfiguration = {
      apiKey,
      appUserID: userId ?? null,
    };

    await Purchases.configure(config);

    console.log('RevenueCat: Initialized successfully');
  } catch (error) {
    console.error('RevenueCat: Initialization failed', error);
    throw error;
  }
};

/**
 * Identify a user with RevenueCat.
 * Call this after the user signs in with Clerk.
 * 
 * @param userId - The Clerk user ID
 */
export const identifyUser = async (userId: string): Promise<CustomerInfo> => {
  if (Platform.OS === 'web') {
    throw new Error('RevenueCat is not supported on web');
  }

  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
};

/**
 * Log out the current user from RevenueCat.
 * Call this when the user signs out of Clerk.
 */
export const logoutUser = async (): Promise<CustomerInfo> => {
  if (Platform.OS === 'web') {
    throw new Error('RevenueCat is not supported on web');
  }

  return await Purchases.logOut();
};

/**
 * Get the current customer info (subscription status, entitlements, etc.)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  if (Platform.OS === 'web') {
    throw new Error('RevenueCat is not supported on web');
  }

  return await Purchases.getCustomerInfo();
};

/**
 * Get all available offerings (products/packages).
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (Platform.OS === 'web') {
    return null;
  }

  const offerings = await Purchases.getOfferings();
  return offerings.current;
};

/**
 * Purchase a package.
 * 
 * @param pkg - The package to purchase (from getOfferings)
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<CustomerInfo> => {
  if (Platform.OS === 'web') {
    throw new Error('RevenueCat is not supported on web');
  }

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
};

/**
 * Restore previous purchases.
 * Useful when a user reinstalls the app or switches devices.
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  if (Platform.OS === 'web') {
    throw new Error('RevenueCat is not supported on web');
  }

  return await Purchases.restorePurchases();
};

/**
 * Check if a user has an active entitlement.
 * 
 * @param customerInfo - Customer info object from RevenueCat
 * @param entitlementId - The ID of the entitlement to check (e.g., "premium", "pro")
 */
export const hasActiveEntitlement = (
  customerInfo: CustomerInfo,
  entitlementId: string
): boolean => {
  if (Platform.OS === 'web') {
    return false;
  }

  return typeof customerInfo.entitlements.active[entitlementId] !== 'undefined';
};

/**
 * Entitlement identifiers used in the app.
 * Update these to match your RevenueCat dashboard configuration.
 */
export const ENTITLEMENTS = {
  /** Premium subscription entitlement */
  PREMIUM: 'premium',
  /** Pro subscription entitlement (example of tiered access) */
  PRO: 'pro',
} as const;

export type EntitlementId = typeof ENTITLEMENTS[keyof typeof ENTITLEMENTS];
