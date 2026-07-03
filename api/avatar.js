import { get } from "@vercel/blob";

export default async function handler(req, res) {
  const name = req.query.name;

  if (!name || name.includes("..") || name.includes("/")) {
    return res.status(400).end();
  }

  try {
    const blob = await get(name, { access: "private" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return res.status(404).end();
    }

    const chunks = [];
    for await (const chunk of blob.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    res.setHeader("Content-Type", blob.blob?.contentType || "image/png");
    // Immutable: URL already has a cache-busting timestamp, so 1-year cache is safe.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(buffer);
  } catch {
    return res.status(404).end();
  }
}
