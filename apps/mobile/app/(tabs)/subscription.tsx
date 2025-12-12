import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';
import {
  getOfferings,
  purchasePackage,
  getCustomerInfo,
  restorePurchases,
  hasActiveEntitlement,
  ENTITLEMENTS,
  type PurchasesPackage,
  type CustomerInfo,
} from '@/lib/revenuecat';

/**
 * Subscription Screen
 * Displays available subscription plans and handles purchases
 */
export default function SubscriptionScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPremium = customerInfo ? hasActiveEntitlement(customerInfo, ENTITLEMENTS.PRO) : false;

  // Load offerings and customer info
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [offering, info] = await Promise.all([
        getOfferings(),
        getCustomerInfo(),
      ]);

      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
      }
      setCustomerInfo(info);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle purchase
  const handlePurchase = async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    setError(null);

    try {
      const info = await purchasePackage(pkg);
      if (info) {
        setCustomerInfo(info);
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        setError(err.message || 'Purchase failed');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    setIsPurchasing(true);
    setError(null);

    try {
      const info = await restorePurchases();
      setCustomerInfo(info);
    } catch (err: any) {
      setError(err.message || 'Restore failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Already subscribed view
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ Premium Member</Text>
          </View>

          <View style={styles.premiumCard}>
            <Text style={styles.premiumCardTitle}>You're all set!</Text>
            <Text style={styles.premiumCardDescription}>
              Thank you for being a premium member. Enjoy all the exclusive features.
            </Text>
          </View>

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Your Premium Benefits:</Text>
            <FeatureItem text="✓ Unlimited access" included />
            <FeatureItem text="✓ Priority support" included />
            <FeatureItem text="✓ Advanced features" included />
            <FeatureItem text="✓ No ads" included />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock all features and get the most out of Arc
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresList}>
          <FeatureItem text="✓ Unlimited access to all features" included />
          <FeatureItem text="✓ Priority customer support" included />
          <FeatureItem text="✓ Advanced AI features" included />
          <FeatureItem text="✓ No advertisements" included />
          <FeatureItem text="✓ Early access to new features" included />
        </View>

        {/* Packages */}
        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.identifier}
              package_={pkg}
              onPurchase={() => handlePurchase(pkg)}
              isPurchasing={isPurchasing}
            />
          ))}
        </View>

        {/* No packages fallback */}
        {packages.length === 0 && (
          <View style={styles.noPackages}>
            <Text style={styles.noPackagesText}>
              No subscription plans available at this time.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isPurchasing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Subscriptions will automatically renew unless canceled. Cancel anytime
          in your account settings. By subscribing, you agree to our Terms of
          Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  text: string;
  included: boolean;
}

function FeatureItem({ text, included }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text
        style={[
          styles.featureText,
          included ? styles.featureIncluded : styles.featureExcluded,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

interface PackageCardProps {
  package_: PurchasesPackage;
  onPurchase: () => void;
  isPurchasing: boolean;
}

function PackageCard({ package_, onPurchase, isPurchasing }: PackageCardProps) {
  const isMonthly = package_.packageType === 'MONTHLY';
  const isAnnual = package_.packageType === 'ANNUAL';
  const isBestValue = isAnnual;

  return (
    <View style={[styles.packageCard, isBestValue && styles.packageCardBestValue]}>
      {isBestValue && (
        <View style={styles.bestValueBadge}>
          <Text style={styles.bestValueText}>Best Value</Text>
        </View>
      )}
      <Text style={styles.packageTitle}>
        {isMonthly ? 'Monthly' : isAnnual ? 'Annual' : package_.identifier}
      </Text>
      <Text style={styles.packagePrice}>
        {package_.product.priceString}
        <Text style={styles.packagePeriod}>
          {isMonthly ? '/month' : isAnnual ? '/year' : ''}
        </Text>
      </Text>
      {isAnnual && (
        <Text style={styles.packageSavings}>Save up to 40%</Text>
      )}
      <TouchableOpacity
        style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
        onPress={onPurchase}
        disabled={isPurchasing}
      >
        {isPurchasing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.purchaseButtonText}>Subscribe</Text>
        )}
      </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: theme.colors.error.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error.dark,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  premiumBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  premiumBadgeText: {
    color: theme.colors.primaryDark,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md,
  },
  premiumCardTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  premiumCardDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresList: {
    marginBottom: theme.spacing.xl,
  },
  featuresTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    paddingVertical: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSize.md,
  },
  featureIncluded: {
    color: theme.colors.text,
  },
  featureExcluded: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  packagesContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  packageCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    ...theme.shadow.sm,
  },
  packageCardBestValue: {
    borderColor: theme.colors.primary,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  bestValueText: {
    color: '#fff',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  packageTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  packagePrice: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
  },
  packagePeriod: {
    fontSize: theme.fontSize.md,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  packageSavings: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success.DEFAULT,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  purchaseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  noPackages: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noPackagesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  restoreButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  terms: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: theme.spacing.md,
  },
});
