import { get } from "@vercel/blob";

const STATE_PATHNAME = "valten-character-state.json";
const CONFIG_PATHNAME = "valten-sheet-config.json";

async function readBlob(pathname) {
  try {
    const blob = await get(pathname, { access: "private" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) return {};
    const chunks = [];
    for await (const chunk of blob.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    return {};
  }
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

  // Union spellClasses from state and config so class assignments survive even
  // when syncToApp ran after the last app session (state might not reflect it yet).
  const stateClasses = state.spellClasses ?? {};
  const configClasses = config.spellClasses ?? {};
  const allClassKeys = new Set([...Object.keys(stateClasses), ...Object.keys(configClasses)]);
  const spellClasses = {};
  for (const key of allClassKeys) {
    const sc = stateClasses[key] ?? {};
    const cc = configClasses[key] ?? {};
    const allLevels = new Set([
      ...Object.keys(sc.knownByLevel ?? {}),
      ...Object.keys(cc.knownByLevel ?? {}),
    ]);
    const knownByLevel = {};
    for (const lvl of allLevels) {
      knownByLevel[lvl] = [
        ...new Set([...(sc.knownByLevel?.[lvl] ?? []), ...(cc.knownByLevel?.[lvl] ?? [])]),
      ];
    }
    spellClasses[key] = {
      label: sc.label ?? cc.label ?? key,
      cantrips: [...new Set([...(sc.cantrips ?? []), ...(cc.cantrips ?? [])])],
      knownByLevel,
    };
  }

  // Card data sources (in priority order):
  // 1. customSpellCards in state — spells added / edited via the in-app picker
  // 2. spellCards in config   — spells previously imported from the Custom Spells sheet tab
  // State takes priority so in-app edits are preserved; config fills the gap for
  // spells that only exist in the sheet and never went through the app picker.
  const configCardMap = {};
  for (const card of config.spellCards ?? []) {
    if (card.title) configCardMap[card.title] = card;
  }
  const stateCardMap = state.customSpellCards ?? {};
  const allCustomCards = { ...configCardMap, ...stateCardMap };

  // Build a map: spell name → { level, classes[] }
  // Use the human-readable label ("Cleric", "Warlock") so the sheet's dropdown
  // validation accepts the values — the raw keys are lowercase internal identifiers.
  const spellMeta = {};
  const record = (name, level, classKey) => {
    const label = spellClasses[classKey]?.label ?? classKey;
    if (!spellMeta[name]) spellMeta[name] = { level, classes: [] };
    if (!spellMeta[name].classes.includes(label)) spellMeta[name].classes.push(label);
  };

  for (const [classKey, cls] of Object.entries(spellClasses)) {
    for (const name of cls.cantrips ?? []) record(name, "Cantrip", classKey);
    for (const [level, names] of Object.entries(cls.knownByLevel ?? {})) {
      for (const name of names) record(name, String(level), classKey);
    }
  }

  // Export spells that have card data AND a class assignment.
  const rows = Object.entries(allCustomCards)
    .filter(([name]) => spellMeta[name])
    .map(([name, card]) => {
      const { level, classes } = spellMeta[name];
      return {
        spell_name: name,
        class: classes[0] ?? "",
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
