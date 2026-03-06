import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const registrationId = session.metadata?.registrationId;

    if (registrationId) {
      const supabase = createAdminClient();

      await supabase
        .from("team_registrations")
        .update({
          registration_status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          amount_paid: session.amount_total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const registrationId = paymentIntent.metadata?.registrationId;

    if (registrationId) {
      const supabase = createAdminClient();

      await supabase
        .from("team_registrations")
        .update({
          registration_status: "paid",
          stripe_payment_intent_id: paymentIntent.id,
          amount_paid: paymentIntent.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);
    }
  }

  return NextResponse.json({ received: true });
}
