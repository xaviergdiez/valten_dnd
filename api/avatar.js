import { get } from "@vercel/blob";

export default async function handler(req, res) {
  const name = req.query.name;

  if (!name || name.includes("..") || name.includes("/")) {
    return res.status(400).end();
  }

  try {
    const blob = await get(name, { access: "private" });
    if (!blob || blob.statusCode !== 200) return res.status(404).end();

    const buffer = Buffer.from(await new Response(blob.stream).arrayBuffer());
    res.setHeader("Content-Type", blob.contentType || "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(buffer);
  } catch {
    return res.status(404).end();
  }
}
