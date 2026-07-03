import { put, get } from "@vercel/blob";

// Uses the Gemini image generation model via Google AI Studio key.
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const CONFIG_PATHNAME = "valten-sheet-config.json";

function buildPrompt(p) {
  const parts = [p.race, p.gender, p.background].filter(Boolean);
  if (p.classLevel) parts.push(p.classLevel);
  const identity = parts.join(", ");
  const name = p.characterName || "A character";
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

async function streamToText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// Writes the new avatarUrls back into the config blob so they survive sheet re-syncs.
// Intentionally fire-and-forget — runs after the response is sent.
function updateConfigAvatar(avatarUrls) {
  (async () => {
    try {
      const existing = await get(CONFIG_PATHNAME, { access: "private" });
      if (!existing || existing.statusCode !== 200 || !existing.stream) return;
      const text = await streamToText(existing.stream);
      const cfg = JSON.parse(text);
      cfg.avatarUrls = avatarUrls;
      await put(CONFIG_PATHNAME, JSON.stringify(cfg), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } catch {
      // Non-fatal — avatar URLs are already returned to the client.
    }
  })();
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

    const slug = (profile.characterName || "character")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const ext = image.mimeType.includes("jpeg") ? "jpg" : "png";
    // Unique name per generation — no overwrite, no stale content.
    const blobName = `avatar-${slug}-${Date.now()}.${ext}`;

    await put(blobName, image.buffer, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: image.mimeType,
    });

    // Serve through the proxy so the store stays private.
    // Unique blobName per generation acts as the cache-buster.
    const proxyUrl = `/api/avatar?name=${encodeURIComponent(blobName)}`;
    const avatarUrls = { full: proxyUrl, crop: proxyUrl };

    // Respond immediately — don't block on config blob update.
    updateConfigAvatar(avatarUrls);

    return res.status(200).json({ ok: true, avatarUrls });
  } catch (err) {
    console.error("generate-avatar error:", err);
    return res.status(500).json({ error: err.message });
  }
}
