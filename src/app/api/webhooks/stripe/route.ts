import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function getStripeInstance() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
}

export async function POST(request: NextRequest) {
  const stripe = getStripeInstance();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const searchIndexId = session.metadata?.search_index_id;
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

      if (searchIndexId && subscriptionId) {
        await supabase
          .from("search_indices")
          .update({
            is_active: true,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", searchIndexId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const isActive = subscription.status === "active" || subscription.status === "trialing";

      await supabase
        .from("search_indices")
        .update({ is_active: isActive })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("search_indices")
        .update({ is_active: false, stripe_subscription_id: null })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
      const subscriptionId = typeof subId === "string" ? subId : subId?.id;

      if (subscriptionId) {
        await supabase
          .from("search_indices")
          .update({ is_active: false })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
