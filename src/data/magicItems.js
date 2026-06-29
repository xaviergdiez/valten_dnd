// Source: homebrew rules doc (Frost-Maw rules + added spells), shared 2026-06-27.
// "Magical Weapon", "Chilling Crush", and "Innate Necrosis" are quoted verbatim
// from the doc. "Spiritual Maw", "Improved Innate Necrosis", and "Vampiric
// Frost" are paraphrased from a summary pass — wording isn't final, re-check
// against the doc if it changes.
//
// The doc itself notes the attack/damage bonus progression's level gating is
// undecided (character level vs. Warlock level) — shown here as reference
// only, not auto-applied to the Attacks table.

export const magicItemsSeed = [
  {
    id: "item-frostmaw",
    title: "Frost-Maw",
    subtitle: "Valten's Warhammer — magical weapon, charge-fueled",
    chargeMultiplier: 2, // max charges = 2 × Proficiency Bonus
    chargesUsed: 0,
    features: [
      {
        name: "Magical Weapon",
        cost: null,
        effect: "The Frost-Maw counts as a Magical Weapon.",
      },
      {
        name: "Chilling Crush",
        cost: 2,
        effect:
          "When you hit a creature with your Frost-Maw, you can spend 2 charges to immediately infuse the weapon with the Chill Touch Cantrip, and do additional Necrotic Damage equal to the Chill Touch's damage dice.",
      },
      {
        name: "Innate Necrosis",
        cost: 1,
        effect:
          "When you are holding Frost-Maw, you can spend 1 Charge, and ignore the need for Concentration on the Detect Necrosis Spell.",
      },
      {
        name: "Spiritual Maw",
        cost: 2,
        level: 7,
        effect: "(Paraphrased) Spend charges to infuse the weapon with the Spiritual Weapon spell.",
      },
      {
        name: "Improved Innate Necrosis",
        cost: 1,
        level: 9,
        effect: "(Paraphrased) Ignore the need for Concentration on the Protection from Necrosis spell.",
      },
      {
        name: "Vampiric Frost",
        cost: "Up to Proficiency Bonus",
        level: 9,
        effect:
          "(Paraphrased) Add 1d6 Necrotic damage per charge spent on a hit; heal an amount equal to the additional damage dealt.",
      },
    ],
    bonusProgression: [
      { atLevel: "Level 7 / Warlock 2", bonus: "+1 to hit and damage" },
      { atLevel: "Level 11 / Warlock 4", bonus: "+2 to hit and damage" },
      { atLevel: "Level 15 / Warlock 6", bonus: "+3 to hit and damage" },
    ],
    regain:
      "Regain all charges on a Long Rest, or by expending one use of Channel Divinity. Alternatively, as a bonus action, sacrifice a spell slot to regain charges equal to the slot's level.",
  },
  {
    id: "item-helmet",
    title: "Helmet of Social Acceptance",
    subtitle: "Magic Item",
    chargeMultiplier: null,
    features: [],
    description: "A magic helmet that lets Valten pass as ordinarily alive in polite company.",
  },
];
