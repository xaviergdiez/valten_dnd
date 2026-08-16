import Stripe from "stripe";
import { redis } from "../lib/storage.js";

// Stripe signature verification needs the raw request body — Vercel's default
// JSON parsing would break it.
export const config = { api: { bodyParser: false } };

const CREDITS_PER_PACK = 10;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe] bad signature:", err.message);
    return res.status(400).json({ error: "invalid_signature" });
  }

  if (event.type === "checkout.session.completed") {
    const uid = event.data.object.client_reference_id;
    // NX dedupe: Stripe retries webhooks — never credit the same event twice.
    const fresh = await redis.set(`stripe_evt:${event.id}`, 1, { nx: true, ex: 86400 });
    if (fresh && uid) {
      await redis.incrby(`credits:${uid}`, CREDITS_PER_PACK);
    }
  }

  return res.status(200).json({ received: true });
}
