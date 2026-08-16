import { useRef, useState } from "react";
import { findSpellCard, newSpellClass } from "../data/spells";
import CheckboxGroup from "./ui/CheckboxGroup";
import Icon from "./ui/Icon";
import NumberInput from "./ui/NumberInput";
import SpellRow from "./SpellRow";
import SpellPicker from "./SpellPicker";
import MagicItemCard from "./MagicItemCard";
import SectionCard from "./layout/SectionCard";
import "./SpellsPanel.css";

const MAGIC_ITEMS_TAB = "Magic Items";

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
  spellDatabase,
}) {
  const classKeys = Object.keys(spellClasses);
  const [tab, setTab] = useState(classKeys[0] ?? MAGIC_ITEMS_TAB);
  const [justAdded, setJustAdded] = useState(() => new Set());
  const pickerRef = useRef(null);
  const [pickerCtx, setPickerCtx] = useState({ classKey: null, level: null });

  // Config hydration can add classes after mount — land on the first one
  // instead of leaving the user on an empty tab.
  const activeTab = tab === MAGIC_ITEMS_TAB || spellClasses[tab] ? tab : classKeys[0] ?? MAGIC_ITEMS_TAB;

  const addSpellClass = () => {
    const label = window.prompt("Spellcasting class name (e.g. Cleric, Warlock)");
    if (!label?.trim()) return;
    const key = label.trim().toLowerCase().replace(/\s+/g, "-");
    if (spellClasses[key]) return setTab(key);
    setSpellClasses((prev) => ({ ...prev, [key]: newSpellClass(label.trim()) }));
    setTab(key);
  };

  const removeSpellClass = (classKey) => {
    if (!window.confirm(`Remove the ${spellClasses[classKey]?.label ?? classKey} spell list?`)) return;
    setSpellClasses((prev) => {
      const { [classKey]: _, ...rest } = prev;
      return rest;
    });
    setTab(MAGIC_ITEMS_TAB);
  };

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

  const removeSlotLevel = (classKey, level) =>
    updateClass(classKey, (c) => ({
      ...c,
      slots: c.slots.filter((s) => s.level !== level),
    }));

  const renameCantrip = (classKey, index, oldName, newName) => {
    renameSpell(oldName, newName);
    updateClass(classKey, (c) => ({ ...c, cantrips: c.cantrips.map((x, i) => (i === index ? newName : x)) }));
  };
  const removeCantrip = (classKey, index) =>
    updateClass(classKey, (c) => ({ ...c, cantrips: c.cantrips.filter((_, i) => i !== index) }));
  const addCantripBlank = (classKey) => {
    const name = "New Cantrip";
    updateClass(classKey, (c) => ({ ...c, cantrips: [...c.cantrips, name] }));
    setJustAdded((prev) => new Set(prev).add(name));
  };

  const openPicker = (classKey, level) => {
    setPickerCtx({ classKey, level });
    pickerRef.current?.open();
  };

  const handlePickSpell = (spell) => {
    const { classKey, level } = pickerCtx;
    if (level === "cantrip") {
      updateClass(classKey, (c) => ({ ...c, cantrips: [...c.cantrips, spell.name] }));
    } else {
      updateClass(classKey, (c) => ({
        ...c,
        knownByLevel: { ...c.knownByLevel, [level]: [...(c.knownByLevel[level] ?? []), spell.name] },
      }));
    }
    // Pre-populate the card from the database entry
    const cardLevel = String(spell.cardLevel ?? "") === "0" ? "Cantrip" : spell.cardLevel;
    setCustomCards((prev) => ({
      ...prev,
      [spell.name]: {
        cardLevel,
        school: spell.school,
        castTime: spell.castTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
        description: spell.description,
      },
    }));
  };

  const handleCustomSpell = () => {
    const { classKey, level } = pickerCtx;
    if (level === "cantrip") {
      addCantripBlank(classKey);
    } else {
      addKnownBlank(classKey, level);
    }
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
  const addKnownBlank = (classKey, level) => {
    const name = "New Spell";
    updateClass(classKey, (c) => ({ ...c, knownByLevel: { ...c.knownByLevel, [level]: [...(c.knownByLevel[level] ?? []), name] } }));
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
    if (!cls) return null;
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
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => removeSlotLevel(classKey, slot.level)}
                  aria-label={`Remove level ${slot.level} slots`}
                >
                  <Icon name="close" />
                </button>
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
          <button type="button" className="add-row-button" onClick={() => openPicker(classKey, "cantrip")}>
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
            <button type="button" className="add-row-button" onClick={() => openPicker(classKey, level)}>
              + Add Spell
            </button>
          </SectionCard>
        ))}
      </div>
    );
  };

  return (
    <SectionCard className="spells-panel">
      <SpellPicker
        ref={pickerRef}
        database={spellDatabase}
        levelFilter={pickerCtx.level != null ? String(pickerCtx.level) : undefined}
        onPick={handlePickSpell}
        onCustom={handleCustomSpell}
      />
      <div className="spells-panel__tabs" role="tablist">
        {classKeys.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            className={`spells-panel__tab ${activeTab === key ? "spells-panel__tab--active" : ""}`}
            onClick={() => setTab(key)}
          >
            {spellClasses[key].label || key}
          </button>
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === MAGIC_ITEMS_TAB}
          className={`spells-panel__tab ${activeTab === MAGIC_ITEMS_TAB ? "spells-panel__tab--active" : ""}`}
          onClick={() => setTab(MAGIC_ITEMS_TAB)}
        >
          {MAGIC_ITEMS_TAB}
        </button>
        <button type="button" className="spells-panel__tab" onClick={addSpellClass}>
          + Class
        </button>
      </div>

      {classKeys.includes(activeTab) && (
        <>
          {renderClass(activeTab)}
          <button
            type="button"
            className="add-row-button"
            onClick={() => removeSpellClass(activeTab)}
          >
            Remove {spellClasses[activeTab].label || activeTab}
          </button>
        </>
      )}
      {activeTab === MAGIC_ITEMS_TAB && (
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
