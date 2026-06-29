// Feature/Trait entries rendered as Feat Cards. Source: Features & Traits box,
// 5E_CharacterSheet_Valten.pdf page 1. Seed only — editable/persisted from here
// on so new class features from leveling up can be added.

export const featsSeed = [
  {
    id: "feat-channel-divinity",
    title: "Channel Divinity",
    source: "Cleric (Life Domain)",
    description: "Destroy Undead. Preserve Life.",
  },
  {
    id: "feat-disciple-of-life",
    title: "Disciple of Life",
    source: "Cleric (Life Domain)",
    description: "Healing spells restore additional hit points equal to 2 plus the spell slot's level.",
  },
  {
    id: "feat-healer",
    title: "Healer",
    source: "Feat",
    description: "Healer's Kit use restores 1d6 + 4 + max hit dice.",
  },
  {
    id: "feat-undead",
    title: "Undead",
    source: "Racial Condition",
    description:
      "Immune to poison damage, poisoned, and disease. No need to eat or sleep. Resistant to necrotic (half). Vulnerable to radiant (double); holy water burns. Direct healing cast on you deals damage instead. Darkvision 60 ft.",
  },
];
