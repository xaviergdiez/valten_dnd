// Per-character spell data. Spellcasting classes are created in-app ("+ Add
// spellcasting class") or imported from a Google Sheet; the card catalog is
// populated from the sheet's Custom Spells / SpellData tabs.

export const spellClassesSeed = {};

// Card catalog for the current character. Mutable module singleton: reset by a
// full page reload on character switch.
let _spellCards = [];

// Live-exported binding so updateSpellCatalog() updates the catalog and callers
// that import `spellCards` directly see the new array (ES module live binding).
export { _spellCards as spellCards };

export function updateSpellCatalog(cards) {
  // Merge incoming cards into the existing catalog — override by title, append new.
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

export function newSpellClass(label) {
  return {
    label,
    info: { className: label, ability: "", saveDC: 0, attackBonus: 0 },
    slots: [{ level: 1, total: 2 }],
    cantrips: [],
    knownByLevel: { 1: [] },
  };
}
