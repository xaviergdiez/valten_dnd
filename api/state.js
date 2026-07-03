import { get, put } from "@vercel/blob";

const PATHNAME = "valten-character-state.json";

async function streamToText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default async function handler(req, res) {
  // Prevent CDN caching — every response must be fresh.
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      const result = await get(PATHNAME, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) {
        return res.status(200).json({});
      }
      const text = await streamToText(result.stream);
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(200).json({});
    }
  }

  if (req.method === "PUT") {
    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "invalid_body" });
    }
    try {
      await put(PATHNAME, JSON.stringify(body), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[state] put failed:", err?.message);
      return res.status(500).json({ error: "save_failed" });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).end();
}
