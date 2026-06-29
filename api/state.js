import { get, put } from "@vercel/blob";

const PATHNAME = "valten-character-state.json";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await get(PATHNAME, { access: "private" });
      if (!result || result.statusCode !== 200) {
        return res.status(200).json({});
      }
      const text = await new Response(result.stream).text();
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(200).json({});
    }
  }

  if (req.method === "PUT") {
    try {
      await put(PATHNAME, JSON.stringify(req.body ?? {}), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "save_failed" });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).end();
}
