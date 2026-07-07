import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function readData(resource) {
  try {
    const data = await redis.get(resource);
    return data ?? {};
  } catch {
    return {};
  }
}

export async function writeData(resource, data) {
  await redis.set(resource, data);
}

export async function readAvatar() {
  try {
    const data = await redis.get("avatar");
    if (!data) return null;
    const { b64, mimeType } = data;
    return {
      buffer: Buffer.from(b64, "base64"),
      contentType: mimeType ?? "image/png",
    };
  } catch {
    return null;
  }
}

export async function writeAvatar(mimeType, imageBuffer) {
  await redis.set("avatar", { mimeType, b64: imageBuffer.toString("base64") });
}
