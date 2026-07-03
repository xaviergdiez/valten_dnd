import { get } from "@vercel/blob";

const STATE_PATHNAME = "valten-character-state.json";
const CONFIG_PATHNAME = "valten-sheet-config.json";

async function readBlob(pathname) {
  try {
    const blob = await get(pathname, { access: "private" });
    if (blob?.statusCode === 200) {
      return JSON.parse(await new Response(blob.stream).text());
    }
  } catch {}
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const auth = req.headers["authorization"] ?? "";
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const [state, config] = await Promise.all([
    readBlob(STATE_PATHNAME),
    readBlob(CONFIG_PATHNAME),
  ]);

  // State blob has the user's latest edits; config is the sheet-synced baseline.
  const spellClasses = state.spellClasses ?? config.spellClasses ?? {};
  const customCards = state.customSpellCards ?? {};

  // Build a map: spell name → { level, classes[] }
  const spellMeta = {};
  const record = (name, level, classKey) => {
    if (!spellMeta[name]) spellMeta[name] = { level, classes: [] };
    if (!spellMeta[name].classes.includes(classKey)) spellMeta[name].classes.push(classKey);
  };

  for (const [classKey, cls] of Object.entries(spellClasses)) {
    for (const name of cls.cantrips ?? []) record(name, "Cantrip", classKey);
    for (const [level, names] of Object.entries(cls.knownByLevel ?? {})) {
      for (const name of names) record(name, String(level), classKey);
    }
  }

  // Export only spells that have a custom card entry AND a class assignment.
  const rows = Object.entries(customCards)
    .filter(([name]) => spellMeta[name])
    .map(([name, card]) => {
      const { level, classes } = spellMeta[name];
      return {
        spell_name: name,
        level,
        school: card.school ?? "",
        casting_time: card.castTime ?? "",
        range: card.range ?? "",
        components: card.components ?? "",
        duration: card.duration ?? "",
        description: card.description ?? "",
        classes: classes.join(", "),
      };
    })
    .sort((a, b) => {
      const la = a.level === "Cantrip" ? "0" : a.level;
      const lb = b.level === "Cantrip" ? "0" : b.level;
      return la.localeCompare(lb) || a.spell_name.localeCompare(b.spell_name);
    });

  return res.status(200).json({ rows });
}
