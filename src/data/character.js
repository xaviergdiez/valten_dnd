// Seed data: 5E_CharacterSheet_Valten.pdf. This is the *initial* state only —
// the live app treats all of it as editable/persisted so leveling up, gear
// changes, and new spells can be tracked going forward. Saving throws and
// passive perception are computed live from ability scores rather than kept
// as printed constants, since hardcoded values would go stale the moment the
// player edits an ability score or proficiency bonus.

export const profile = {
  name: "Valten",
  nickname: "The Gentle Giant",
  classLevel: "Cleric 7 / Warlock 1",
  background: "Hermit",
  race: "Human Undead",
  inspiration: true,
};

export const proficiencyBonusSeed = 4;

export const combatSeed = {
  armorClass: 20,
  initiative: -1,
  speed: 30,
  hpMax: 49,
  hpCurrentDefault: 49,
  hpTempDefault: 0,
  hitDice: { count: 6, die: 8 },
  deathSaves: { successes: 0, failures: 0 },
};

export const abilityScoresSeed = { str: 15, dex: 8, con: 16, int: 8, wis: 20, cha: 12 };

export const abilityNames = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

// Standard Cleric save proficiencies (Wisdom, Charisma) — editable from here on.
export const saveProficienciesSeed = { str: false, dex: false, con: false, int: false, wis: true, cha: true };

// ability key + proficient flag; modifier is computed live as ability mod (+ prof bonus if proficient)
export const skillsSeed = [
  { name: "Acrobatics", ability: "dex", proficient: false },
  { name: "Animal Handling", ability: "wis", proficient: false },
  { name: "Arcana", ability: "int", proficient: false },
  { name: "Athletics", ability: "str", proficient: true },
  { name: "Deception", ability: "cha", proficient: false },
  { name: "History", ability: "int", proficient: false },
  { name: "Insight", ability: "wis", proficient: true },
  { name: "Intimidation", ability: "cha", proficient: false },
  { name: "Investigation", ability: "int", proficient: false },
  { name: "Medicine", ability: "wis", proficient: true },
  { name: "Nature", ability: "int", proficient: true },
  { name: "Perception", ability: "wis", proficient: true },
  { name: "Performance", ability: "cha", proficient: false },
  { name: "Persuasion", ability: "cha", proficient: false },
  { name: "Religion", ability: "int", proficient: false },
  { name: "Sleight of Hand", ability: "dex", proficient: false },
  { name: "Stealth", ability: "dex", proficient: false },
  { name: "Survival", ability: "wis", proficient: true },
];

// Weapon attacks printed on the sheet, plus every known spell that has its own
// attack roll (ranged/melee spell attack) — Wrathful Smite and similar spells
// that only buff an existing weapon hit are left off since they aren't a
// separate attack line. Fully editable from here on (add/remove/edit rows).
export const attacksSeed = [
  { id: "atk-hammer", name: "Frost-Maw", atkBonus: "+5", damage: "1d8+2" },
  { id: "atk-gsword", name: "G.sword+1", atkBonus: "+5", damage: "2d6+3" },
  { id: "atk-vtouch", name: "V.Touch", atkBonus: "+9", damage: "3d6 Necrotic" },
  { id: "atk-chilltouch", name: "Chill Touch", atkBonus: "+9", damage: "2d8 Necrotic" },
  { id: "atk-guidingbolt", name: "Guiding Bolt", atkBonus: "+8", damage: "4d6 Radiant" },
  { id: "atk-spiritualweapon", name: "Spiritual Weapon", atkBonus: "+8", damage: "1d8+5 Force" },
  { id: "atk-siphonbolt", name: "Siphon Bolt", atkBonus: "+8", damage: "Necrotic" },
];

export const currencySeed = { cp: 0, ep: 0, pp: 0, gp: 284, sp: 0 };

export const equipmentSeed = [
  { id: "eq-gsword", name: "G. Sword +1", quantity: 1, equipped: true },
  { id: "eq-warhammer", name: "Frost-Maw (Warhammer)", quantity: 1, equipped: true },
  { id: "eq-harmor", name: "H. Armor (AC 18)", quantity: 1, equipped: true },
  { id: "eq-shield", name: "Shield (+2)", quantity: 1, equipped: true },
  { id: "eq-holysymbol", name: "Holy Symbol", quantity: 1, equipped: true },
  { id: "eq-priestpack", name: "Priest's Pack", quantity: 1, equipped: false },
  { id: "eq-herbalismkit", name: "Herbalism Kit", quantity: 1, equipped: false },
  { id: "eq-healerskit", name: "Healer's Kit, shrooms", quantity: 1, equipped: false },
  { id: "eq-healingingredient", name: "Healing Ingredient", quantity: 3, equipped: false },
];

export const proficienciesLanguages = {
  languages: ["Human", "Goliath", "Giant"],
  tools: ["Herbalism Kit", "Healer's Kit (10)"],
  armorWeapons: ["Heavy Armor", "Shields", "Weapons (no guns)"],
};

export const personality = {
  traits: "Little patience for civilized society, prefer harshness of the wild",
  ideals: "Greater Good",
  bonds: "Chosen to learn from the Giants",
  flaws: "Struggle to trust soft civilized people",
};

export const appearance = {
  age: 29,
  height: `1.93 m`,
  weight: `111 lb`,
  eyes: "Grey",
  skin: "Pale",
  hair: "Shaved/Beard",
  description:
    "Valten is a rugged, imposing figure, often mistaken for a brute due to his heavy brow and weather-beaten skin. He wears heavy Splint armor draped in the thick furs and pelts of the Voltin indigenous tribes. His movements are deliberate and heavy, mimicking the Goliaths he was raised alongside. He carries a Warhammer that looks like a tool of survival rather than a soldier's weapon.",
};

export const backstory = `Born in the secluded town of Himberwear on the frozen island of Voltin, Valten was raised in a community where Goliaths and Humans live in simple harmony. As is the custom once every generation, Valten was chosen to leave his village and spend five years living among the Ancestral Giants in the northern hills.

He endured the harshest elements to learn their customs and the secrets of 'Giant Speak'—interpreting the vibrations of the earth. He returned not as a warrior, but as a protector and healer, blending the divine magic of the Life domain with the survivalist wisdom of the north.`;

export const allies = [
  {
    name: "The Himberwear Council",
    description: "The elders of his home village who entrusted him with his mission.",
  },
  {
    name: "Ancestral Giants of Voltin",
    description: "He is one of the few humans they view as a 'kin-friend' and will grant him safe passage.",
  },
];

export const treasureSeed = [
  "Diamond (300gp) for revivify",
  "Scroll Case: filled with notes on Giant customs and herbal remedies.",
  "Winter Blanket: a keepsake from the Voltin hills.",
  "Magic crystal from Necro Chernobyl",
];

export const undeadCondition = {
  title: "Undead Condition",
  lines: [
    "Immune: Poison damage, Poisoned, Disease. No food/sleep.",
    "Resist: Necrotic (half)",
    "Vulnerable: Radiant (double). Holy water burns.",
    "Direct healing = damage. Potions, spells cast ON you — avoid.",
    "Blessed Healer = safe (2 + spell level). Casting BY you on allies — conduit spark bypasses curse.",
    "Main weakness: Low CON save (+2). Radiant hits risk.",
  ],
};
