// Supabase Edge Function: RevenueCat Webhook
//
// Handles webhooks from RevenueCat to sync subscription status.
// Configure this URL in RevenueCat dashboard: /functions/v1/revenuecat-webhook
//
// POST /functions/v1/revenuecat-webhook
// Body: RevenueCat webhook payload

import {
  handleCors,
  jsonResponse,
  errorResponse,
  parseRequestBody,
  createSupabaseClient,
} from "../_shared/utils.ts";

// RevenueCat webhook event types
type WebhookEventType =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "NON_RENEWING_PURCHASE"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_RESUMED"
  | "BILLING_ISSUE"
  | "PRODUCT_CHANGE"
  | "EXPIRATION"
  | "TRANSFER";

interface WebhookEvent {
  api_version: string;
  event: {
    type: WebhookEventType;
    app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    expiration_at_ms: number;
    original_transaction_id: string;
    store: string;
    environment: string;
    is_family_share: boolean;
    period_type: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST
  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    const authHeader = req.headers.get("Authorization");
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.warn("Invalid webhook secret");
      return errorResponse("Unauthorized", 401);
    }

    // Parse webhook payload
    const payload = await parseRequestBody<WebhookEvent>(req);
    if (!payload || !payload.event) {
      return errorResponse("Invalid webhook payload");
    }

    const { event } = payload;
    console.log(`Processing RevenueCat webhook: ${event.type}`, {
      app_user_id: event.app_user_id,
      product_id: event.product_id,
    });

    // Get Supabase client with service role (admin access)
    const supabase = createSupabaseClient();

    // Map event to subscription status
    const statusMap: Record<WebhookEventType, string> = {
      INITIAL_PURCHASE: "active",
      RENEWAL: "active",
      CANCELLATION: "canceled",
      UNCANCELLATION: "active",
      NON_RENEWING_PURCHASE: "active",
      SUBSCRIPTION_PAUSED: "canceled",
      SUBSCRIPTION_RESUMED: "active",
      BILLING_ISSUE: "past_due",
      PRODUCT_CHANGE: "active",
      EXPIRATION: "expired",
      TRANSFER: "active",
    };

    const status = statusMap[event.type] || "unknown";
    const isSandbox = event.environment !== "PRODUCTION";

    // Find or create subscription record
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id, user_id")
      .eq("revenuecat_customer_id", event.app_user_id)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status,
          product_identifier: event.product_id,
          entitlements: event.entitlement_ids,
          expiration_date: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
          is_sandbox: isSandbox,
          metadata: {
            original_transaction_id: event.original_transaction_id,
            store: event.store,
            period_type: event.period_type,
            last_event: event.type,
          },
        })
        .eq("id", existingSubscription.id);

      if (updateError) {
        console.error("Failed to update subscription:", updateError);
        return errorResponse("Failed to update subscription", 500);
      }
    } else {
      // Create new subscription record
      // Note: We need to find the profile first by Clerk ID
      // The app_user_id from RevenueCat should be the Clerk user ID

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_id", event.app_user_id)
        .single();

      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: profile?.id || null,
          revenuecat_customer_id: event.app_user_id,
          status,
          product_identifier: event.product_id,
          entitlements: event.entitlement_ids,
          original_purchase_date: new Date().toISOString(),
          expiration_date: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
          is_sandbox: isSandbox,
          metadata: {
            original_transaction_id: event.original_transaction_id,
            store: event.store,
            period_type: event.period_type,
            last_event: event.type,
          },
        });

      if (insertError) {
        console.error("Failed to create subscription:", insertError);
        return errorResponse("Failed to create subscription", 500);
      }
    }

    console.log(`Successfully processed ${event.type} for ${event.app_user_id}`);
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return errorResponse("Internal server error", 500);
  }
});
