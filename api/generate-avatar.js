import sharp from "sharp";
import { writeAvatar, charKey, redis } from "../lib/storage.js";
import { requireUser } from "../lib/auth.js";

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

  const { data: b64 } = imgPart.inlineData;
  return Buffer.from(b64, "base64");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const uid = await requireUser(req, res);
  if (!uid) return;
  const cid = req.body?.c;
  const key = charKey(uid, cid, "avatar");
  if (!key) return res.status(400).json({ error: "invalid_character" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  // DECRBY first = atomic reserve; no read-modify-write race between requests.
  const left = await redis.decrby(`credits:${uid}`, 1);
  if (left < 0) {
    await redis.incrby(`credits:${uid}`, 1);
    return res.status(402).json({ error: "no_credits" });
  }

  const profile = req.body?.profile ?? {};

  try {
    const png = await callGeminiImage(buildPrompt(profile), apiKey);

    // Downscale + JPEG: raw Gemini PNGs base64-encode past Upstash's 1MB request cap.
    const jpeg = await sharp(png).resize({ width: 768 }).jpeg({ quality: 80 }).toBuffer();
    await writeAvatar(key, "image/jpeg", jpeg);

    // Cache-bust via timestamp so the browser fetches the new image.
    const v = Date.now();
    const url = `/api/avatar?c=${cid}&v=${v}`;
    return res.status(200).json({ ok: true, avatarUrls: { full: url, crop: url }, creditsLeft: left });
  } catch (err) {
    await redis.incrby(`credits:${uid}`, 1); // refund on failure
    console.error("generate-avatar error:", err);
    return res.status(500).json({ error: err.message });
  }
}
