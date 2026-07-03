import { put, get } from "@vercel/blob";

const CONFIG_PATHNAME = "valten-sheet-config.json";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const auth = req.headers["authorization"] ?? "";
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    // Read existing config so fields not managed by the sheet (e.g. avatarUrls)
    // are preserved across syncs rather than wiped.
    let existing = {};
    try {
      const blob = await get(CONFIG_PATHNAME, { access: "private" });
      if (blob && blob.statusCode === 200) {
        existing = JSON.parse(await new Response(blob.stream).text());
      }
    } catch {
      // Blob doesn't exist yet — start fresh.
    }

    const sheets = req.body ?? {};
    const config = { ...existing, ...buildConfig(sheets) };

    await put(CONFIG_PATHNAME, JSON.stringify(config), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return res.status(200).json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("sync-sheet error:", err);
    return res.status(500).json({ error: "sync_failed" });
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const num = (v) => Number(v) || 0;
const bool = (v) => v === true || v === "TRUE";
const csv = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);

// Converts a sheet tab (array of row objects keyed by header) to a key→value map.
function toMap(rows, keyCol, valCol) {
  const out = {};
  for (const r of rows ?? []) {
    if (r[keyCol] != null && r[keyCol] !== "") out[String(r[keyCol])] = r[valCol];
  }
  return out;
}

// ─── config builder ───────────────────────────────────────────────────────────

function buildConfig(sheets) {
  const config = {};

  // Profile (key / value) — character identity fields for display and avatar generation
  if (sheets.profile?.length) {
    const p = toMap(sheets.profile, "key", "value");
    config.characterProfile = {
      characterName: String(p.characterName ?? ""),
      nickname: String(p.nickname ?? ""),
      race: String(p.race ?? ""),
      gender: String(p.gender ?? ""),
      background: String(p.background ?? ""),
      age: String(p.age ?? ""),
      height: String(p.height ?? ""),
      weight: String(p.weight ?? ""),
      eyes: String(p.eyes ?? ""),
      skin: String(p.skin ?? ""),
      hair: String(p.hair ?? ""),
      description: String(p.description ?? ""),
    };
  }

  // Stats (key / value)
  if (sheets.stats?.length) {
    const s = toMap(sheets.stats, "key", "value");
    config.classLevel = String(s.classLevel ?? "");
    config.abilityScores = {
      str: num(s.str), dex: num(s.dex), con: num(s.con),
      int: num(s.int), wis: num(s.wis), cha: num(s.cha),
    };
    config.proficiencyBonus = num(s.proficiency);
    config.hpMax = num(s.hpMax);
    config.combatStats = {
      armorClass: num(s.ac),
      initiative: num(s.initiative),
      speed: num(s.speed),
    };
    config.hitDiceBase = { count: num(s.hitDiceCount), die: num(s.hitDiceDie) };
  }

  // Saves (ability / proficient)
  if (sheets.saves?.length) {
    config.saveProficiencies = {};
    for (const r of sheets.saves) {
      if (r.ability) config.saveProficiencies[String(r.ability).toLowerCase()] = bool(r.proficient);
    }
  }

  // Skills (skill / proficient)
  if (sheets.skills?.length) {
    config.skillProficiencies = {};
    for (const r of sheets.skills) {
      if (r.skill) config.skillProficiencies[String(r.skill)] = bool(r.proficient);
    }
  }

  // Attacks (name / atkBonus / damage)
  if (sheets.attacks?.length) {
    config.attacksList = sheets.attacks
      .filter((r) => r.name)
      .map((r, i) => ({ id: `atk-${i}`, name: String(r.name), atkBonus: String(r.atkBonus ?? ""), damage: String(r.damage ?? "") }));
  }

  // Equipment (name / quantity / equipped)
  if (sheets.equipment?.length) {
    config.equipmentList = sheets.equipment
      .filter((r) => r.name)
      .map((r, i) => ({ id: `eq-${i}`, name: String(r.name), quantity: num(r.quantity) || 1, equipped: bool(r.equipped) }));
  }

  // Currency (coin / amount)
  if (sheets.currency?.length) {
    config.currency = {};
    for (const r of sheets.currency) {
      if (r.coin) config.currency[String(r.coin).toLowerCase()] = num(r.amount);
    }
  }

  // Features (name / category / description)
  if (sheets.features?.length) {
    config.featuresList = sheets.features
      .filter((r) => r.name)
      .map((r, i) => ({
        id: `feat-${i}`,
        title: String(r.name),
        source: String(r.category ?? ""),
        description: String(r.description ?? ""),
      }));
  }

  // Spells + spellcasting info + spell slots
  if (sheets.spellcasting?.length || sheets.spellSlots?.length || sheets.spells?.length) {
    const { spellClasses, spellCards } = buildSpellData(sheets);
    // Only overwrite if at least one class was parsed — an empty object would
    // crash SpellsPanel by replacing the seed's cleric/warlock entries.
    if (Object.keys(spellClasses).length > 0) config.spellClasses = spellClasses;
    if (spellCards.length > 0) config.spellCards = spellCards;
  }

  // SpellData tab — full spell database for the in-app picker
  // Expected columns: spell_name, level, school, casting_time, range, components, duration, description
  if (sheets.spellData?.length) {
    const normalizeLevel = (v) => {
      const s = String(v ?? "").trim();
      return s === "0" ? "Cantrip" : s;
    };
    config.spellDatabase = sheets.spellData
      .map((r) => ({
        name: String(r.spell_name || r.name || "").trim(),
        cardLevel: normalizeLevel(r.level),
        school: String(r.school ?? ""),
        castTime: String(r.casting_time ?? ""),
        range: String(r.range ?? ""),
        components: String(r.components ?? ""),
        duration: String(r.duration ?? ""),
        description: String(r.description ?? ""),
      }))
      .filter((s) => s.name);
  }

  return config;
}

function buildSpellData(sheets) {
  // Collect all "always prepared" names across classes for card flagging.
  const alwaysPreparedNames = new Set();

  // Build class skeletons from the Spellcasting tab.
  // Expected columns: class, label, class_name, ability, save_dc, attack_bonus, cantrips, always_prepared
  const spellClasses = {};
  for (const r of sheets.spellcasting ?? []) {
    const key = String(r.class ?? "").toLowerCase();
    if (!key) continue;
    const always = csv(r.always_prepared);
    always.forEach((n) => alwaysPreparedNames.add(n));
    spellClasses[key] = {
      label: String(r.label ?? r.class),
      info: {
        className: String(r.class_name ?? ""),
        ability: String(r.ability ?? ""),
        saveDC: num(r.save_dc),
        attackBonus: num(r.attack_bonus),
      },
      slots: [],
      cantrips: csv(r.cantrips),
      knownByLevel: {},
      alwaysPrepared: always,
    };
  }

  // Spell Slots tab: class / level / total
  for (const r of sheets.spellSlots ?? []) {
    const key = String(r.class ?? "").toLowerCase();
    if (!key || !spellClasses[key]) continue;
    const level = num(r.level);
    if (!spellClasses[key].knownByLevel[level]) spellClasses[key].knownByLevel[level] = [];
    spellClasses[key].slots.push({ level, total: num(r.total) });
  }

  // Custom Spells tab → card catalog + populate knownByLevel
  // Actual columns: spell_name, class, level, range, components, duration, concentration,
  //                 casting_time, ritual, description, material, school, classes
  // `class` (singular) is the primary class and is ignored here; `classes` (plural,
  // comma-sep) is what drives knownByLevel population.
  const spellCards = [];
  for (const r of sheets.spells ?? []) {
    const title = String(r.spell_name ?? "").trim();
    if (!title) continue;
    const level = String(r.level ?? "").trim();
    if (level === "Item") continue; // magic items are handled separately

    spellCards.push({
      title,
      cardLevel: level,
      school: String(r.school ?? ""),
      castTime: String(r.casting_time ?? ""),
      range: String(r.range ?? ""),
      components: String(r.components ?? ""),
      duration: String(r.duration ?? ""),
      description: String(r.description ?? ""),
      alwaysPrepared: alwaysPreparedNames.has(title),
    });

    // Populate knownByLevel for non-cantrip spells that have a classes value.
    if (level !== "Cantrip") {
      const classKeys = csv(r.classes).map((c) => c.toLowerCase());
      for (const key of classKeys) {
        if (!spellClasses[key]) continue;
        if (!spellClasses[key].knownByLevel[level]) spellClasses[key].knownByLevel[level] = [];
        if (!spellClasses[key].knownByLevel[level].includes(title)) {
          spellClasses[key].knownByLevel[level].push(title);
        }
      }
    }
  }

  return { spellClasses, spellCards };
}
