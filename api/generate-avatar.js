import { writeAvatar } from "./lib/storage.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function buildPrompt(p) {
  const parts = [p.race, p.gender, p.background].filter(Boolean);
  if (p.classLevel) parts.push(p.classLevel);
  const identity = parts.join(", ");
  const name  = p.characterName || "A character";
  const looks = p.description || "";
  return (
    `Full body D&D character portrait, portrait orientation. ${name}, ${identity}. ` +
    `${looks} ` +
    `Face and upper body prominently visible in the top half of the image. ` +
    `Epic fantasy illustration, detailed armor and equipment, dramatic lighting, high quality digital art.`
  );
}

async function callGeminiImage(prompt, apiKey) {
  const url = `${GEMINI_BASE}/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini Image API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const imgPart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!imgPart) throw new Error("No image data in Gemini response");

  const { data: b64, mimeType = "image/png" } = imgPart.inlineData;
  return { buffer: Buffer.from(b64, "base64"), mimeType };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const profile = req.body?.profile ?? {};

  try {
    const image = await callGeminiImage(buildPrompt(profile), apiKey);

    // Store in PHP hosting — no Blob operations.
    await writeAvatar(image.mimeType, image.buffer);

    // Cache-bust via timestamp so the browser fetches the new image.
    const v = Date.now();
    const avatarUrls = { full: `/api/avatar?v=${v}`, crop: `/api/avatar?v=${v}` };

    return res.status(200).json({ ok: true, avatarUrls });
  } catch (err) {
    console.error("generate-avatar error:", err);
    return res.status(500).json({ error: err.message });
  }
}
