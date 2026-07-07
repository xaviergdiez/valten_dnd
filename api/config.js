import { readData } from "./lib/storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const [config, spelldb] = await Promise.all([readData("config"), readData("spelldb")]);
  const out = Array.isArray(spelldb) && spelldb.length ? { ...config, spellDatabase: spelldb } : config;
  return res.status(200).json(out);
}
