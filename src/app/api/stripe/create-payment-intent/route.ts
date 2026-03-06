import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrationId } = await request.json();

  if (!registrationId) {
    return NextResponse.json(
      { error: "Missing registrationId" },
      { status: 400 }
    );
  }

  const amount = parseInt(process.env.REGISTRATION_FEE_AMOUNT || "10000", 10);
  const currency = process.env.REGISTRATION_FEE_CURRENCY || "usd";

  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      registrationId,
      clerkUserId: userId,
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
