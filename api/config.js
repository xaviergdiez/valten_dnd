import { readData } from "./lib/storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const config = await readData("config");
  return res.status(200).json(config);
}
