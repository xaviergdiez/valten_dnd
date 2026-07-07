const BASE = process.env.PHP_STORAGE_URL;
const KEY  = process.env.PHP_STORAGE_KEY;

function endpoint(resource) {
  return `${BASE}?r=${resource}`;
}

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${KEY}`, ...extra };
}

export async function readData(resource) {
  try {
    const r = await fetch(endpoint(resource), { headers: authHeaders() });
    if (!r.ok) return {};
    return await r.json();
  } catch {
    return {};
  }
}

export async function writeData(resource, data) {
  const r = await fetch(endpoint(resource), {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Storage write (${resource}) failed: ${r.status}`);
}

export async function readAvatar() {
  const r = await fetch(endpoint("avatar"), { headers: authHeaders() });
  if (!r.ok) return null;
  return {
    buffer: Buffer.from(await r.arrayBuffer()),
    contentType: r.headers.get("content-type") ?? "image/png",
  };
}

export async function writeAvatar(mimeType, imageBuffer) {
  const r = await fetch(endpoint("avatar"), {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ mimeType, b64: imageBuffer.toString("base64") }),
  });
  if (!r.ok) throw new Error(`Avatar write failed: ${r.status}`);
}
