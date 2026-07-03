// Source: Valten_SpellCards.pdf (32 illustrated cards) cross-checked against the
// shared Google Sheet, and the Spellcasting page of 5E_CharacterSheet_Valten.pdf
// (spell slots + known spells per level). Updated 2026-06-27 for the Cleric
// 7 / Warlock 1 multiclass retcon: Detect Necrosis, Siphon Bolt, and Protect
// from Necrosis (renamed Protection from Necrosis) carry the revised mechanics
// from the homebrew rules doc and are always-prepared; Blight is new at 4th
// level; Frost Maw moved out entirely — it's a magic item now, see
// data/magicItems.js, not a spell.

// Seed only — editable/persisted from here on so leveling up can raise slot
// totals, add new spell levels, and add/remove known spells. Two independent
// spellcasting classes since Valten multiclassed into Warlock.
export const spellClassesSeed = {
  cleric: {
    label: "Cleric",
    info: { className: "Cleric Life Domain", ability: "Wisdom", saveDC: 16, attackBonus: 9 },
    slots: [
      { level: 1, total: 4 },
      { level: 2, total: 3 },
      { level: 3, total: 3 },
      { level: 4, total: 1 },
    ],
    cantrips: ["Spare the Dying", "Toll the Dead", "Word of Radiance", "Sacred Flame", "Chill Touch"],
    knownByLevel: {
      1: ["Bless", "Cure Wounds", "Healing Word", "Guiding Bolt", "Command", "Sanctuary", "Detect Necrosis", "Wrathful Smite"],
      2: ["Lesser Restoration", "Spiritual Weapon", "Hold Person", "Augury", "Silence", "Siphon Bolt", "Death Armor"],
      3: ["Beacon of Hope", "Revivify", "Spirit Guardians", "Dispel Magic", "Mass Healing Word", "Protection from Necrosis", "Vampiric Touch"],
      4: ["Blight"],
    },
  },
  warlock: {
    label: "Warlock",
    info: { className: "Warlock (Pact Magic)", ability: "Charisma", saveDC: 13, attackBonus: 5 },
    // Pact Magic: 1 slot at Warlock 1, recovers on a short rest (not modeled
    // separately here — tracked the same way as the Cleric's slots).
    slots: [{ level: 1, total: 1 }],
    cantrips: ["Eldritch Blast", "Frostbite"],
    knownByLevel: {
      1: ["Armor of Agathys", "Hex"],
    },
  },
};

// Spells that are always prepared (don't count against the Cleric's normal
// prepared-spell limit) per the homebrew rules doc — granted by Frost-Maw's
// Innate Necrosis line of features.
export const alwaysPreparedSpells = ["Detect Necrosis", "Siphon Bolt", "Protection from Necrosis"];

// All illustrated/known spell cards, in source order.
let _spellCards = [
  { title: "Chill Touch", cardLevel: "Cantrip", school: "Necromancy", castTime: "1 Action", range: "120 ft", components: "V, S", duration: "1 round", description: `"The mountain wind spares no one." Ranged spell attack (+9). 2d8 Necrotic damage. Target can't heal until your next turn.` },
  { title: "Eldritch Blast", cardLevel: "Cantrip", school: "Evocation", castTime: "1 Action", range: "120 ft", components: "V, S", duration: "Instantaneous", description: `"Tethered to rock and ice, of the earth and onto light." Hurl 2 spears of black ice. Ranged spell attack (+8). 1d10 Force per hit.` },
  { title: "Frostbite", cardLevel: "Cantrip", school: "Evocation", castTime: "1 Action", range: "60 ft", components: "V, S", duration: "Instantaneous", description: `"I stand atop the mountain's peak where many worlds meet." CON Save. 2d6 Cold dmg, and target has Disadvantage on its next weapon attack.` },
  { title: "Sacred Flame", cardLevel: "Cantrip", school: "Evocation", castTime: "1 Action", range: "60 ft", components: "V, S", duration: "Instantaneous", description: `"Voltin's pyre burns the unworthy." DEX save (ignores cover) or take 1d8 Radiant damage.` },
  { title: "Spare the Dying", cardLevel: "Cantrip", school: "Necromancy", castTime: "1 Action", range: "Touch", components: "V, S", duration: "Instantaneous", description: `"The mountain's heart still beats for you." Touch a living creature with 0 HP. They become stable.` },
  { title: "Toll the Dead", cardLevel: "Cantrip", school: "Necromancy", castTime: "1 Action", range: "60 ft", components: "V, S", duration: "Instantaneous", description: `"Hear the avalanche approach." WIS Save. 2d8 Necrotic damage (2d12 if the target is missing HP).` },
  { title: "Word of Radiance", cardLevel: "Cantrip", school: "Evocation", castTime: "1 Action", range: "5 ft", components: "V, M", duration: "Instantaneous", description: `"The dawn breaks the highest peaks." All chosen adjacent creatures must pass a CON save or take 1d6 Radiant damage.` },
  { title: "Armor of Agathys", cardLevel: "1", school: "Abjuration", castTime: "1 Action", range: "Self", components: "V, S, M", duration: "1 hour", description: `"Consumed by the dark, and bound to the cold..." Gain 5 Temp HP. If hit in melee, attacker takes 5 Cold dmg. (Warlock Slot)` },
  { title: "Bless", cardLevel: "1", school: "Enchantment", castTime: "1 Action", range: "30 ft", components: "V, S, M", duration: "1 min (C)", description: `"The Ancestors guide your steps in the snow." Up to 3 targets add 1d4 to attack rolls and saving throws.` },
  { title: "Cure Wounds", cardLevel: "1", school: "Evocation", castTime: "1 Action", range: "Touch", components: "V, S", duration: "Instantaneous", description: `"Draw from the deep roots, stand again." Heals 1d8+5+3. Safe for you if cast on allies via Conduit Spark.` },
  { title: "Detect Magic", cardLevel: "1", school: "Divination", castTime: "1 Action", range: "Self", components: "V, S", duration: "10 min (C)", description: `"The earth vibrates with unseen forces." Sense the presence of magic within 30 ft.` },
  { title: "Detect Necrosis", cardLevel: "1", school: "Divination", castTime: "1 Action (Ritual)", range: "Self", components: "V, S, M", duration: "Concentration, 10 min", description: `"I smell the rot beneath the permafrost." Sense the presence of Necrosis within 30 feet of yourself. (M: an object touched by necrosis, consumed by the spell.)` },
  { title: "Guiding Bolt", cardLevel: "1", school: "Evocation", castTime: "1 Action", range: "120 ft", components: "V, S", duration: "Instantaneous", description: `"A flare in the blinding blizzard." Ranged spell attack (+8). 4d6 Radiant. Next attack against target has advantage.` },
  { title: "Healing Word", cardLevel: "1", school: "Evocation", castTime: "1 Bonus Action", range: "60 ft", components: "V", duration: "Instantaneous", description: `"The mountain endures!" Heals 1d4+5+3. Safe for you if cast on allies via Conduit Spark.` },
  { title: "Hex", cardLevel: "1", school: "Enchantment", castTime: "1 Bonus Action", range: "90 ft", components: "V, S, M", duration: "1 hour (C)", description: `"Down below lightning crackles as black clouds form like shackles." Curse target. Extra 1d6 Necrotic on hit. Disadv on chosen ability checks.` },
  { title: "Sanctuary", cardLevel: "1", school: "Abjuration", castTime: "1 Bonus Action", range: "30 ft", components: "V, S, M", duration: "1 min", description: `"The great mammoth protects its young." Any creature targeting the warded ally must pass a WIS save or lose the attack.` },
  { title: "Wrathful Smite", cardLevel: "1", school: "Evocation", castTime: "1 Bonus Action", range: "Self", components: "V", duration: "1 min (C)", description: `"The fury of the northern gales!" Next melee hit deals extra 1d6 Psychic. WIS Save or Frightened. Action to break fear.` },
  { title: "Augury", cardLevel: "2", school: "Divination", castTime: "1 Minute", range: "Self", components: "V, S, M", duration: "Instantaneous", description: `"I read the cracks in the glacier." Receive an omen (Weal or Woe) about a specific course of action in the next 30 minutes.` },
  { title: "Blindness/Deafness", cardLevel: "2", school: "Necromancy", castTime: "1 Action", range: "30 ft", components: "V", duration: "1 min", description: `"The whiteout claims your senses." CON Save or target is blinded or deafened.` },
  { title: "Death Armor", cardLevel: "2", school: "Necromancy", castTime: "1 Action", range: "Self", components: "V, S", duration: "1 hour", description: `"The grave's embrace shields me." Envelop yourself in a protective aura of necrotic energy.` },
  { title: "Hold Person", cardLevel: "2", school: "Enchantment", castTime: "1 Action", range: "60 ft", components: "V, S, M", duration: "1 min (C)", description: `"Freeze like the northern lakes." Paralyze a humanoid. WIS Save. Command them to freeze in place.` },
  { title: "Lesser Restoration", cardLevel: "2", school: "Abjuration", castTime: "1 Action", range: "Touch", components: "V, S", duration: "Instantaneous", description: `"The fresh thaw washes away the blight." End one disease, blinded, deafened, paralyzed, or poisoned condition.` },
  { title: "Siphon Bolt", cardLevel: "2", school: "Necromancy", castTime: "1 Action", range: "120 ft", components: "S", duration: "Instantaneous", description: `"The tundra drinks your warmth." (M: a rotten piece of flesh.) Launch two siphon bolts at one or two creatures in range. Each hit deals 1d12 Necrotic damage; on any bolt that rolls 10+, regain HP equal to half that roll, rounded down.` },
  { title: "Spiritual Weapon", cardLevel: "2", school: "Evocation", castTime: "1 Bonus Action", range: "60 ft", components: "V, S", duration: "1 min", description: `"The Ancestors strike with me." Summon a floating shard of black Voltin ice. Melee spell attack (+8). 1d8+5 Force damage.` },
  { title: "Beacon of Hope", cardLevel: "3", school: "Abjuration", castTime: "1 Action", range: "30 ft", components: "V, S", duration: "1 min (C)", description: `"The campfire in the endless night." Allies have advantage on WIS/Death saves and regain maximum possible HP from healing.` },
  { title: "Dispel Magic", cardLevel: "3", school: "Abjuration", castTime: "1 Action", range: "120 ft", components: "V, S", duration: "Instantaneous", description: `"The storm scatters the weave." End magical effects on target. Automatic for 3rd level or lower.` },
  { title: "Mass Healing Word", cardLevel: "3", school: "Evocation", castTime: "1 Bonus Action", range: "60 ft", components: "V", duration: "Instantaneous", description: `"The pack fights as one!" Heal up to 6 creatures 1d4+5+3. Safe for you if cast on allies via Conduit Spark.` },
  { title: "Protection from Necrosis", cardLevel: "3", school: "Abjuration", castTime: "1 Action", range: "Touch", components: "V, S, M", duration: "Concentration, 10 min", description: `"The frozen earth rejects the rot." (M: a skeletal finger from an undead, and a 100+gp diamond, both consumed.) Touch up to 6 creatures. They halve damage from necrotic fields and have advantage on saving throws caused by a necrotic field.` },
  { title: "Revivify", cardLevel: "3", school: "Necromancy", castTime: "1 Action", range: "Touch", components: "V, S, M", duration: "Instantaneous", description: `"The mountain rejects your spirit, return to the flesh!" Consume 300gp diamond. Restore life to a creature dead less than 1 min.` },
  { title: "Spirit Guardians", cardLevel: "3", school: "Conjuration", castTime: "1 Action", range: "15 ft", components: "V, S, M", duration: "10 min (C)", description: `"Ancestors of Voltin, form the wall!" Skeletal Giants. Halves enemy speed. WIS Save. 3d8 Necrotic on fail, half on success.` },
  { title: "Vampiric Touch", cardLevel: "3", school: "Necromancy", castTime: "1 Action", range: "Self", components: "V, S", duration: "1 min (C)", description: `"The earth drinks, and so do I." Melee spell attack (+9). 3d6 Necrotic damage. You heal half the damage dealt.` },
  { title: "Blight", cardLevel: "4", school: "Necromancy", castTime: "1 Action", range: "30 ft", components: "V, S", duration: "Instantaneous", description: `Necrotic energy withers a creature. CON save or take 8d8 Necrotic damage (half on success). Plants and plant creatures have disadvantage on the save and take maximum damage.` },
  // Standard spells on Valten's known list with no illustrated card in the 32-card deck.
  { title: "Command", cardLevel: "1", school: "Enchantment", castTime: "1 Action", range: "60 ft", components: "V", duration: "1 round", description: `Speak a one-word command (Approach, Drop, Flee, Grovel, Halt) to a creature you can see. WIS save or it obeys on its next turn.` },
  { title: "Silence", cardLevel: "2", school: "Illusion", castTime: "1 Action", range: "120 ft", components: "V, S", duration: "10 min (C)", description: `No sound can be created within or pass through a 20-ft-radius sphere centered on a point you choose. Deafened creatures are immune to thunder damage within it.` },
].map((card) => ({ ...card, alwaysPrepared: alwaysPreparedSpells.includes(card.title) }));

// Live-exported binding so updateSpellCatalog() updates the catalog and callers
// that import `spellCards` directly see the new array (ES module live binding).
export { _spellCards as spellCards };

export function updateSpellCatalog(cards) {
  // Merge incoming cards into the existing catalog — override by title, append new.
  // Never replace the whole array, or hardcoded cards not in the sheet would vanish.
  const overrides = new Map(cards.map((c) => [c.title, c]));
  const seen = new Set();
  const merged = _spellCards.map((c) => {
    seen.add(c.title);
    return overrides.get(c.title) ?? c;
  });
  for (const c of cards) {
    if (!seen.has(c.title)) merged.push(c);
  }
  _spellCards = merged;
}

export function findSpellCard(name) {
  return _spellCards.find((c) => c.title === name);
}
