import { get } from "@vercel/blob";

const PATHNAME = "valten-sheet-config.json";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  try {
    const result = await get(PATHNAME, { access: "private" });
    if (!result || result.statusCode !== 200) return res.status(200).json({});
    const text = await new Response(result.stream).text();
    return res.status(200).json(JSON.parse(text));
  } catch {
    return res.status(200).json({});
  }
}
