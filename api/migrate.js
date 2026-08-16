// TEMPORARY one-shot migration: global Redis keys → char:<uid>:<cid>:* for the
// original Valten character. Delete this file (and its Valten literals) once
// the migration is verified. Self-contained on purpose — src/data/character.js
// is being genericized in the same deploy.
import crypto from "node:crypto";
import { readData, writeData, charKey, redis } from "../lib/storage.js";
import { getUser, saveUser } from "../lib/auth.js";

const VALTEN = {
  characterProfile: {
    characterName: "Valten",
    nickname: "The Gentle Giant",
    race: "Human Undead",
    gender: "Male",
    background: "Hermit",
    age: "29",
    height: "1.93 m",
    weight: "111 lb",
    eyes: "Grey",
    skin: "Pale",
    hair: "Shaved/Beard",
    description:
      "Valten is a rugged, imposing figure, a towering, undead skeletal warrior. Faint remnants of a frozen winter beard cling to his skull. He is clad in heavy iron splint armor draped heavily in thick, weather-beaten northern winter pelts. He carries Frost Maw, a Warhammer made from the remains of a baby Ice Dragon. The oversized, terrifying dragon skull acts as the heavy head of the weapon, completely devoid of any crafted metal. Valten's clawed skeletal left hand is wreathed in a swirling aura of black frost and dark magic, violently ripping ghostly, pale-blue spectral life essence from the dragon's bone marrow.",
  },
  background: {
    backstory: `Born in the secluded town of Himberwear on the frozen island of Voltin, Valten was raised in a community where Goliaths and Humans live in simple harmony. As is the custom once every generation, Valten was chosen to leave his village and spend five years living among the Ancestral Giants in the northern hills.

He endured the harshest elements to learn their customs and the secrets of 'Giant Speak'—interpreting the vibrations of the earth. He returned not as a warrior, but as a protector and healer, blending the divine magic of the Life domain with the survivalist wisdom of the north.`,
    traits: "Little patience for civilized society, prefer harshness of the wild",
    ideals: "Greater Good",
    bonds: "Chosen to learn from the Giants",
    flaws: "Struggle to trust soft civilized people",
    allies:
      "The Himberwear Council — the elders of his home village who entrusted him with his mission.\nAncestral Giants of Voltin — he is one of the few humans they view as a 'kin-friend' and will grant him safe passage.",
    languages: "Human, Goliath, Giant",
    tools: "Herbalism Kit, Healer's Kit (10)",
    armorWeapons: "Heavy Armor, Shields, Weapons (no guns)",
  },
  // Seed feats were previously module constants (never persisted unless edited),
  // so re-add them here if the saved state has none.
  feats: [
    { id: "feat-channel-divinity", title: "Channel Divinity", source: "Cleric (Life Domain)", description: "Destroy Undead. Preserve Life." },
    { id: "feat-disciple-of-life", title: "Disciple of Life", source: "Cleric (Life Domain)", description: "Healing spells restore extra HP (2 + spell level)." },
    { id: "feat-blessed-healer", title: "Blessed Healer", source: "Cleric (Life Domain)", description: "When you heal an ally with a spell of 1st level or higher, you regain 2 + the spell's level HP." },
  ],
  undeadFeature: {
    id: "feat-undead",
    title: "Undead Condition",
    source: "Curse",
    description: [
      "Immune: Poison damage, Poisoned, Disease. No food/sleep.",
      "Resist: Necrotic (half)",
      "Vulnerable: Radiant (double). Holy water burns.",
      "Direct healing = damage. Potions, spells cast ON you — avoid.",
      "Blessed Healer = safe (2 + spell level). Casting BY you on allies — conduit spark bypasses curse.",
      "Main weakness: Low CON save (+2). Radiant hits risk.",
    ].join("\n"),
  },
  magicItems: [
    {
      id: "item-frostmaw",
      title: "Frost-Maw",
      subtitle: "Warhammer, Legendary",
      chargeMultiplier: 1,
      chargesUsed: 0,
      features: [],
      description:
        "A warhammer made from the remains of a baby Ice Dragon. The oversized dragon skull acts as the heavy head of the weapon, completely devoid of any crafted metal.",
    },
  ],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const auth = req.headers["authorization"] ?? "";
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const uid = req.body?.uid;
  if (!uid) return res.status(400).json({ error: "uid_required" });

  const user = await getUser(uid);
  if (!user) return res.status(404).json({ error: "unknown_user" });

  const cid = crypto.randomUUID();

  const [state, config, spelldb, avatar] = await Promise.all([
    readData("state"),
    readData("config"),
    redis.get("spelldb"),
    redis.get("avatar"),
  ]);

  state.characterProfile = { ...VALTEN.characterProfile, ...(state.characterProfile ?? {}) };
  state.background = VALTEN.background;
  state.classLevel ||= "Cleric 7 / Warlock 1";

  const feats = state.featuresList?.length ? state.featuresList : VALTEN.feats;
  state.featuresList = feats.some((f) => f.id === "feat-undead")
    ? feats
    : [...feats, VALTEN.undeadFeature];

  if (!state.magicItems?.length) state.magicItems = VALTEN.magicItems;
  if (!state.avatarUrls?.full) {
    state.avatarUrls = { full: "/valten-full.jpg", crop: "/valten-avatar.jpg" };
  }

  await writeData(charKey(uid, cid, "state"), state);
  await writeData(charKey(uid, cid, "config"), config);
  if (spelldb) await writeData(charKey(uid, cid, "spelldb"), spelldb);
  if (avatar) await writeData(charKey(uid, cid, "avatar"), avatar);

  user.chars = [...(user.chars ?? []), { id: cid, name: "Valten" }];
  await saveUser(uid, user);

  // Global keys left in place as backup — delete from the Upstash console later.
  return res.status(200).json({ ok: true, cid });
}
