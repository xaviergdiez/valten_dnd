import Stripe from "stripe";
import { requireUser } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const uid = await requireUser(req, res);
  if (!uid) return;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const proto = req.headers["x-forwarded-proto"] ?? "http";
  const origin = `${proto}://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: uid,
    success_url: `${origin}/#/characters?paid=1`,
    cancel_url: `${origin}/#/characters`,
  });

  return res.status(200).json({ url: session.url });
}
