import { useState } from "react";
import { findSpellCard } from "../data/spells";
import CheckboxGroup from "./ui/CheckboxGroup";
import NumberInput from "./ui/NumberInput";
import SpellRow from "./SpellRow";
import MagicItemCard from "./MagicItemCard";
import SectionCard from "./layout/SectionCard";
import "./SpellsPanel.css";

const SUB_TABS = ["Cleric", "Warlock", "Magic Items"];

function newMagicItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function SpellsPanel({
  spellClasses,
  setSpellClasses,
  slotsUsed,
  setSlotsUsed,
  prepared,
  setPrepared,
  customCards,
  setCustomCards,
  magicItems,
  setMagicItems,
  proficiencyBonus,
}) {
  const [tab, setTab] = useState("Cleric");
  // Names that should render expanded-for-authoring right after being added —
  // session-only, doesn't need to persist across reloads.
  const [justAdded, setJustAdded] = useState(() => new Set());

  const togglePrepared = (name) => setPrepared((prev) => ({ ...prev, [name]: !prev[name] }));
  const updateCustomCard = (name) => (updated) => setCustomCards((prev) => ({ ...prev, [name]: updated }));

  const renameSpell = (oldName, newName) => {
    setCustomCards((prev) => {
      if (!prev[oldName]) return prev;
      const { [oldName]: moved, ...rest } = prev;
      return { ...rest, [newName]: moved };
    });
    setPrepared((prev) => {
      if (!(oldName in prev)) return prev;
      const { [oldName]: moved, ...rest } = prev;
      return { ...rest, [newName]: moved };
    });
    setJustAdded((prev) => {
      if (!prev.has(oldName)) return prev;
      const next = new Set(prev);
      next.delete(oldName);
      next.add(newName);
      return next;
    });
  };

  const updateClass = (classKey, updater) =>
    setSpellClasses((prev) => ({ ...prev, [classKey]: updater(prev[classKey]) }));

  const updateInfo = (classKey, field) => (e) =>
    updateClass(classKey, (c) => ({ ...c, info: { ...c.info, [field]: e.target.value } }));
  const updateInfoNumber = (classKey, field) => (n) =>
    updateClass(classKey, (c) => ({ ...c, info: { ...c.info, [field]: n } }));

  const updateSlotTotal = (classKey, level) => (n) =>
    updateClass(classKey, (c) => ({
      ...c,
      slots: c.slots.map((s) => (s.level === level ? { ...s, total: n } : s)),
    }));

  const addSpellLevel = (classKey) =>
    updateClass(classKey, (c) => {
      const nextLevel = Math.max(0, ...c.slots.map((s) => s.level)) + 1;
      if (nextLevel > 9) return c;
      return { ...c, slots: [...c.slots, { level: nextLevel, total: 1 }], knownByLevel: { ...c.knownByLevel, [nextLevel]: [] } };
    });

  const renameCantrip = (classKey, index, oldName, newName) => {
    renameSpell(oldName, newName);
    updateClass(classKey, (c) => ({ ...c, cantrips: c.cantrips.map((x, i) => (i === index ? newName : x)) }));
  };
  const removeCantrip = (classKey, index) =>
    updateClass(classKey, (c) => ({ ...c, cantrips: c.cantrips.filter((_, i) => i !== index) }));
  const addCantrip = (classKey) => {
    const name = "New Cantrip";
    updateClass(classKey, (c) => ({ ...c, cantrips: [...c.cantrips, name] }));
    setJustAdded((prev) => new Set(prev).add(name));
  };

  const renameKnown = (classKey, level, index, oldName, newName) => {
    renameSpell(oldName, newName);
    updateClass(classKey, (c) => ({
      ...c,
      knownByLevel: { ...c.knownByLevel, [level]: c.knownByLevel[level].map((x, i) => (i === index ? newName : x)) },
    }));
  };
  const removeKnown = (classKey, level, index) =>
    updateClass(classKey, (c) => ({
      ...c,
      knownByLevel: { ...c.knownByLevel, [level]: c.knownByLevel[level].filter((_, i) => i !== index) },
    }));
  const addKnown = (classKey, level) => {
    const name = "New Spell";
    updateClass(classKey, (c) => ({ ...c, knownByLevel: { ...c.knownByLevel, [level]: [...c.knownByLevel[level], name] } }));
    setJustAdded((prev) => new Set(prev).add(name));
  };

  const updateMagicItem = (id, field) => (e) =>
    setMagicItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: e.target.value } : i)));
  const removeMagicItem = (id) => setMagicItems((prev) => prev.filter((i) => i.id !== id));
  const addMagicItem = () =>
    setMagicItems((prev) => [
      ...prev,
      { id: newMagicItemId(), title: "New Item", subtitle: "Magic Item", description: "", chargeMultiplier: null, features: [] },
    ]);

  const renderClass = (classKey) => {
    const cls = spellClasses[classKey];
    return (
      <div className="spells-panel__class">
        <SectionCard title="Spellcasting">
          <div className="spells-panel__info-grid">
            <div>
              <p className="spells-panel__info-label">Class</p>
              <input className="inline-input" value={cls.info.className} onChange={updateInfo(classKey, "className")} />
            </div>
            <div>
              <p className="spells-panel__info-label">Ability</p>
              <input className="inline-input" value={cls.info.ability} onChange={updateInfo(classKey, "ability")} />
            </div>
            <div>
              <p className="spells-panel__info-label">Save DC</p>
              <NumberInput className="inline-input" value={cls.info.saveDC} onChange={updateInfoNumber(classKey, "saveDC")} />
            </div>
            <div>
              <p className="spells-panel__info-label">Attack Bonus</p>
              <NumberInput className="inline-input" value={cls.info.attackBonus} onChange={updateInfoNumber(classKey, "attackBonus")} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Spell Slots">
          <div className="spells-panel__slots">
            {cls.slots.map((slot) => (
              <div key={slot.level} className="spells-panel__slot-row">
                <span className="spells-panel__slot-total">
                  Total
                  <NumberInput
                    className="inline-input spells-panel__slot-total-input"
                    value={slot.total}
                    onChange={updateSlotTotal(classKey, slot.level)}
                  />
                </span>
                <CheckboxGroup
                  label={`Level ${slot.level}`}
                  total={slot.total}
                  used={slotsUsed[`${classKey}:${slot.level}`] ?? 0}
                  onChange={(n) => setSlotsUsed((prev) => ({ ...prev, [`${classKey}:${slot.level}`]: n }))}
                />
              </div>
            ))}
          </div>
          <button type="button" className="add-row-button" onClick={() => addSpellLevel(classKey)}>
            + Add Spell Level (level up)
          </button>
        </SectionCard>

        <SectionCard title="Cantrips">
          <div className="spells-panel__rows">
            {cls.cantrips.map((name, i) => (
              <SpellRow
                key={i}
                name={name}
                card={findSpellCard(name)}
                customCard={customCards[name]}
                onChangeCustomCard={updateCustomCard(name)}
                defaultExpanded={justAdded.has(name)}
                onRename={(value) => renameCantrip(classKey, i, name, value)}
                onRemove={() => removeCantrip(classKey, i)}
              />
            ))}
          </div>
          <button type="button" className="add-row-button" onClick={() => addCantrip(classKey)}>
            + Add Cantrip
          </button>
        </SectionCard>

        {Object.entries(cls.knownByLevel).map(([level, names]) => (
          <SectionCard key={level} title={`Level ${level} Spells Known`}>
            <div className="spells-panel__rows">
              {names.map((name, i) => (
                <SpellRow
                  key={i}
                  name={name}
                  card={findSpellCard(name)}
                  customCard={customCards[name]}
                  onChangeCustomCard={updateCustomCard(name)}
                  defaultExpanded={justAdded.has(name)}
                  prepared={!!prepared[name]}
                  onTogglePrepared={() => togglePrepared(name)}
                  onRename={(value) => renameKnown(classKey, level, i, name, value)}
                  onRemove={() => removeKnown(classKey, level, i)}
                />
              ))}
            </div>
            <button type="button" className="add-row-button" onClick={() => addKnown(classKey, level)}>
              + Add Spell
            </button>
          </SectionCard>
        ))}
      </div>
    );
  };

  return (
    <SectionCard className="spells-panel">
      <div className="spells-panel__tabs" role="tablist">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`spells-panel__tab ${tab === t ? "spells-panel__tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Cleric" && renderClass("cleric")}
      {tab === "Warlock" && renderClass("warlock")}
      {tab === "Magic Items" && (
        <div className="spells-panel__items">
          {magicItems.map((item) => (
            <MagicItemCard
              key={item.id}
              item={item}
              proficiencyBonus={proficiencyBonus}
              onUpdate={(updater) => setMagicItems((prev) => prev.map((i) => (i.id === item.id ? updater(i) : i)))}
              onRemove={() => removeMagicItem(item.id)}
            />
          ))}
          <button type="button" className="add-row-button spells-panel__add-item" onClick={addMagicItem}>
            + Add Magic Item
          </button>
        </div>
      )}
    </SectionCard>
  );
}
