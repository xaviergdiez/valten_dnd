import { put, get } from "@vercel/blob";

// Uses the Gemini image generation model via Google AI Studio key.
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const CONFIG_PATHNAME = "valten-sheet-config.json";

function buildPrompt(p, type) {
  const parts = [p.race, p.gender, p.background].filter(Boolean);
  if (p.classLevel) parts.push(p.classLevel);
  const identity = parts.join(", ");
  const name = p.characterName || "A character";
  const looks = p.description || "";

  if (type === "crop") {
    return (
      `Close-up bust portrait of a D&D character, face and upper chest only, no full body visible. ` +
      `${name}, ${identity}. ${looks} ` +
      `Face centered and dominant in the frame. Epic fantasy illustration, dramatic lighting, high quality digital art.`
    );
  }
  return (
    `Full body D&D character portrait, portrait orientation. ${name}, ${identity}. ` +
    `${looks} ` +
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
    // Generate full body + close-up bust in parallel — same description keeps
    // styling consistent; dedicated bust prompt ensures face fills the header circle.
    const [full, crop] = await Promise.all([
      callGeminiImage(buildPrompt(profile, "full"), apiKey),
      callGeminiImage(buildPrompt(profile, "crop"), apiKey),
    ]);

    const slug = (profile.characterName || "character")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const ext = (m) => (m.includes("jpeg") ? "jpg" : "png");
    const fullName = `avatar-${slug}-full.${ext(full.mimeType)}`;
    const cropName = `avatar-${slug}-crop.${ext(crop.mimeType)}`;

    await Promise.all([
      put(fullName, full.buffer, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: full.mimeType,
      }),
      put(cropName, crop.buffer, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: crop.mimeType,
      }),
    ]);

    const ts = Date.now();
    const avatarUrls = {
      full: `/api/avatar?name=${encodeURIComponent(fullName)}&t=${ts}`,
      crop: `/api/avatar?name=${encodeURIComponent(cropName)}&t=${ts}`,
    };

    // Merge avatar URLs back into the config blob so they survive sheet re-syncs.
    try {
      const existing = await get(CONFIG_PATHNAME, { access: "private" });
      if (existing) {
        const text = await new Response(existing.stream).text();
        const cfg = JSON.parse(text);
        cfg.avatarUrls = avatarUrls;
        await put(CONFIG_PATHNAME, JSON.stringify(cfg), {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
        });
      }
    } catch {
      // Non-fatal — avatar URLs are still returned to the client.
    }

    return res.status(200).json({ ok: true, avatarUrls });
  } catch (err) {
    console.error("generate-avatar error:", err);
    return res.status(500).json({ error: err.message });
  }
}
