"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { redirect } from "next/navigation";

export async function createCheckoutSession(searchIndexId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get developer profile
  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile) throw new Error("Developer profile required");

  // Create or reuse Stripe customer
  let customerId = devProfile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { user_id: user.id, developer_profile_id: devProfile.id },
    });
    customerId = customer.id;

    await supabase
      .from("developer_profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", devProfile.id);
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("Stripe price not configured");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      search_index_id: searchIndexId,
      developer_profile_id: devProfile.id,
    },
    success_url: `${siteUrl}/profile/developer/indices/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/profile/developer/indices/checkout/cancel`,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createCustomerPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile?.stripe_customer_id) {
    throw new Error("No Stripe customer found");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: devProfile.stripe_customer_id,
    return_url: `${siteUrl}/profile/developer`,
  });

  if (session.url) {
    redirect(session.url);
  }
}
