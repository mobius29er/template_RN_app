import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  type PurchasesPackage,
  type CustomerInfo,
} from '@/lib/revenuecat';

/**
 * Paywall Component Props
 */
interface PaywallProps {
  /** Whether the paywall modal is visible */
  visible: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Callback when purchase is successful */
  onPurchaseSuccess?: (customerInfo: CustomerInfo) => void;
  /** Custom title for the paywall */
  title?: string;
  /** Custom subtitle for the paywall */
  subtitle?: string;
  /** Custom features list */
  features?: string[];
}

/**
 * Paywall Component
 * 
 * A modular, reusable paywall modal that displays subscription options
 * and handles the purchase flow with RevenueCat.
 * 
 * @example
 * ```tsx
 * <Paywall
 *   visible={showPaywall}
 *   onClose={() => setShowPaywall(false)}
 *   onPurchaseSuccess={(info) => console.log('Purchased!', info)}
 *   title="Unlock Premium"
 *   features={[
 *     '✓ Unlimited access',
 *     '✓ No ads',
 *     '✓ Priority support',
 *   ]}
 * />
 * ```
 */
export function Paywall({
  visible,
  onClose,
  onPurchaseSuccess,
  title = 'Upgrade to Premium',
  subtitle = 'Unlock all features and get the most out of the app',
  features = [
    '✓ Unlimited access to all features',
    '✓ Priority customer support',
    '✓ Advanced AI capabilities',
    '✓ No advertisements',
    '✓ Early access to new features',
  ],
}: PaywallProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load offerings when modal opens
  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const offering = await getOfferings();
      if (offering?.availablePackages) {
        const pkgs = offering.availablePackages;
        setPackages(pkgs);
        // Select annual by default if available
        const annual = pkgs.find((p: PurchasesPackage) => p.packageType === 'ANNUAL');
        setSelectedPackage(annual || pkgs[0] || null);
      }
    } catch (err: any) {
      setError('Failed to load subscription options');
      console.error('Paywall load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsPurchasing(true);
    setError(null);

    try {
      const customerInfo = await purchasePackage(selectedPackage);
      if (customerInfo) {
        onPurchaseSuccess?.(customerInfo);
        onClose();
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        setError(err.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    setError(null);

    try {
      const customerInfo = await restorePurchases();
      if (customerInfo) {
        // Check if they now have entitlements
        const hasEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
        if (hasEntitlements) {
          onPurchaseSuccess?.(customerInfo);
          onClose();
        } else {
          setError('No previous purchases found');
        }
      }
    } catch (err: any) {
      setError('Restore failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            {features.map((feature, index) => (
              <Text key={index} style={styles.featureText}>
                {feature}
              </Text>
            ))}
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {/* Package Selection */}
              <View style={styles.packages}>
                {packages.map((pkg) => {
                  const isSelected = selectedPackage?.identifier === pkg.identifier;
                  const isAnnual = pkg.packageType === 'ANNUAL';

                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      style={[
                        styles.packageOption,
                        isSelected && styles.packageOptionSelected,
                      ]}
                      onPress={() => setSelectedPackage(pkg)}
                      disabled={isPurchasing}
                    >
                      {isAnnual && (
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>SAVE 40%</Text>
                        </View>
                      )}
                      <View style={styles.packageContent}>
                        <View style={styles.packageLeft}>
                          <View
                            style={[
                              styles.radioOuter,
                              isSelected && styles.radioOuterSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <View>
                            <Text style={styles.packageTitle}>
                              {isAnnual ? 'Annual' : 'Monthly'}
                            </Text>
                            {isAnnual && (
                              <Text style={styles.packageSubtitle}>Best value</Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.packageRight}>
                          <Text style={styles.packagePrice}>
                            {pkg.product.priceString}
                          </Text>
                          <Text style={styles.packagePeriod}>
                            {isAnnual ? '/year' : '/month'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Purchase Button */}
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  (isPurchasing || !selectedPackage) && styles.purchaseButtonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={isPurchasing || !selectedPackage}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              {/* Restore */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={isPurchasing}
              >
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Terms */}
          <Text style={styles.terms}>
            Payment will be charged to your Apple ID account at the confirmation of
            purchase. Subscription automatically renews unless it is canceled at
            least 24 hours before the end of the current period. Your account will
            be charged for renewal within 24 hours prior to the end of the current
            period. Manage and cancel your subscriptions in Account Settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
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
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  packages: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  packageOption: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  packageOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  saveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.success.DEFAULT,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  packageTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  packageSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  packageRight: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  packagePeriod: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  purchaseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
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
    fontSize: 10,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: theme.spacing.lg,
  },
});
