// Generic blank-character seeds. Everything is editable/persisted per character
// from the moment the sheet is opened; these are only the starting values.

export const profileSeed = {
  characterName: "",
  nickname: "",
  race: "",
  gender: "",
  background: "",
  age: "",
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",
  description: "",
};

export const backgroundSeed = {
  backstory: "",
  traits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  allies: "",
  languages: "",
  tools: "",
  armorWeapons: "",
};

export const proficiencyBonusSeed = 2;

export const combatSeed = {
  armorClass: 10,
  initiative: 0,
  speed: 30,
  hpMax: 10,
  hpCurrentDefault: 10,
  hpTempDefault: 0,
  hitDice: { count: 1, die: 8 },
  deathSaves: { successes: 0, failures: 0 },
};

export const abilityScoresSeed = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

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

export const saveProficienciesSeed = { str: false, dex: false, con: false, int: false, wis: false, cha: false };

// The 18 standard 5e skills; modifier is computed live as ability mod (+ prof bonus if proficient)
export const skillsSeed = [
  { name: "Acrobatics", ability: "dex", proficient: false },
  { name: "Animal Handling", ability: "wis", proficient: false },
  { name: "Arcana", ability: "int", proficient: false },
  { name: "Athletics", ability: "str", proficient: false },
  { name: "Deception", ability: "cha", proficient: false },
  { name: "History", ability: "int", proficient: false },
  { name: "Insight", ability: "wis", proficient: false },
  { name: "Intimidation", ability: "cha", proficient: false },
  { name: "Investigation", ability: "int", proficient: false },
  { name: "Medicine", ability: "wis", proficient: false },
  { name: "Nature", ability: "int", proficient: false },
  { name: "Perception", ability: "wis", proficient: false },
  { name: "Performance", ability: "cha", proficient: false },
  { name: "Persuasion", ability: "cha", proficient: false },
  { name: "Religion", ability: "int", proficient: false },
  { name: "Sleight of Hand", ability: "dex", proficient: false },
  { name: "Stealth", ability: "dex", proficient: false },
  { name: "Survival", ability: "wis", proficient: false },
];

export const attacksSeed = [];
export const currencySeed = { cp: 0, ep: 0, pp: 0, gp: 0, sp: 0 };
export const equipmentSeed = [];
export const treasureSeed = [];

// Neutral portrait placeholder — shown until an avatar is generated or synced.
export const avatarPlaceholder =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23efe9d8"/><circle cx="50" cy="38" r="16" fill="%23c9c0a8"/><path d="M18 94c4-20 16-30 32-30s28 10 32 30z" fill="%23c9c0a8"/></svg>';
