import { readData, writeData } from "./lib/storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const state = await readData("state");
    return res.status(200).json(state);
  }

  if (req.method === "PUT") {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "invalid_body" });
    }
    try {
      await writeData("state", body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[state] write failed:", err?.message);
      return res.status(500).json({ error: "save_failed" });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).end();
}
