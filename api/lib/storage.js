const BASE = process.env.PHP_STORAGE_URL;
const KEY  = process.env.PHP_STORAGE_KEY;

// Key sent as query param — avoids Apache stripping the Authorization header.
function endpoint(resource) {
  return `${BASE}?r=${resource}&k=${encodeURIComponent(KEY)}`;
}

export async function readData(resource) {
  try {
    const r = await fetch(endpoint(resource));
    if (!r.ok) return {};
    return await r.json();
  } catch {
    return {};
  }
}

export async function writeData(resource, data) {
  let r;
  try {
    r = await fetch(endpoint(resource), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    throw new Error(`Storage fetch (${resource}) network error: ${err.message}`);
  }
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Storage write (${resource}) HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
}

export async function readAvatar() {
  const r = await fetch(endpoint("avatar"));
  if (!r.ok) return null;
  return {
    buffer: Buffer.from(await r.arrayBuffer()),
    contentType: r.headers.get("content-type") ?? "image/png",
  };
}

export async function writeAvatar(mimeType, imageBuffer) {
  const r = await fetch(endpoint("avatar"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mimeType, b64: imageBuffer.toString("base64") }),
  });
  if (!r.ok) throw new Error(`Avatar write failed: ${r.status}`);
}
