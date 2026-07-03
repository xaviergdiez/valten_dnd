import { get } from "@vercel/blob";

const PATHNAME = "valten-sheet-config.json";

async function streamToText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  res.setHeader("Cache-Control", "no-store");
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
