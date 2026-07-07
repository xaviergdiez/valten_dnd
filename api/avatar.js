import { readAvatar } from "./lib/storage.js";

export default async function handler(req, res) {
  try {
    const avatar = await readAvatar();
    if (!avatar) return res.status(404).end();
    res.setHeader("Content-Type", avatar.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(avatar.buffer);
  } catch {
    return res.status(404).end();
  }
}
