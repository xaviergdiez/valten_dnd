import { useEffect } from "react";
import { usePersistedState, fetchRemoteState } from "./hooks/usePersistedState";
import { useMediaQuery } from "./hooks/useMediaQuery";
import {
  profile,
  proficiencyBonusSeed,
  combatSeed,
  abilityScoresSeed,
  saveProficienciesSeed,
  skillsSeed,
  attacksSeed,
  currencySeed,
  equipmentSeed,
  treasureSeed,
} from "./data/character";
import { featsSeed } from "./data/feats";
import { spellClassesSeed, updateSpellCatalog } from "./data/spells";
import { magicItemsSeed } from "./data/magicItems";
import Header from "./components/Header";
import getAbilitiesCards from "./components/AbilitiesPanel";
import getCombatCards from "./components/CombatPanel";
import getEquipmentCards from "./components/EquipmentPanel";
import getFeaturesCards from "./components/FeaturesPanel";
import SpellsPanel from "./components/SpellsPanel";
import BackgroundPanel from "./components/BackgroundPanel";
import TabNav from "./components/layout/TabNav";
import CardMasonry from "./components/layout/CardMasonry";
import "./App.css";

const TAB_ORDER = ["Combat", "Abilities & Skills", "Spells", "Equipment", "Features", "Background"];

const skillProficienciesSeed = Object.fromEntries(skillsSeed.map((s) => [s.name, s.proficient]));

export default function App() {
  const [classLevel, setClassLevel] = usePersistedState("classLevel", profile.classLevel);
  const [inspiration, setInspiration] = usePersistedState("inspiration", profile.inspiration);

  const [abilityScores, setAbilityScores] = usePersistedState("abilityScores", abilityScoresSeed);
  const [proficiencyBonus, setProficiencyBonus] = usePersistedState("proficiencyBonus", proficiencyBonusSeed);
  const [saveProficiencies, setSaveProficiencies] = usePersistedState("saveProficiencies", saveProficienciesSeed);
  const [skillProficiencies, setSkillProficiencies] = usePersistedState("skillProficiencies", skillProficienciesSeed);

  const [combatStats, setCombatStats] = usePersistedState("combatStats", {
    armorClass: combatSeed.armorClass,
    initiative: combatSeed.initiative,
    speed: combatSeed.speed,
  });
  const [hpCurrent, setHpCurrent] = usePersistedState("hpCurrent", combatSeed.hpCurrentDefault);
  const [hpMax, setHpMax] = usePersistedState("hpMax", combatSeed.hpMax);
  const [hpTemp, setHpTemp] = usePersistedState("hpTemp", combatSeed.hpTempDefault);
  const [hitDice, setHitDice] = usePersistedState("hitDice", { ...combatSeed.hitDice, used: 0 });
  const [deathSaves, setDeathSaves] = usePersistedState("deathSaves", combatSeed.deathSaves);
  const [attacksList, setAttacksList] = usePersistedState("attacksList", attacksSeed);

  const [currency, setCurrency] = usePersistedState("currency", currencySeed);
  const [equipmentList, setEquipmentList] = usePersistedState("equipmentList", equipmentSeed);

  const [featuresList, setFeaturesList] = usePersistedState("featuresList", featsSeed);

  const [spellClasses, setSpellClasses] = usePersistedState("spellClasses", spellClassesSeed);
  const [slotsUsed, setSlotsUsed] = usePersistedState("spellSlotsUsed", {});
  const [prepared, setPrepared] = usePersistedState("preparedSpells", {});
  const [customCards, setCustomCards] = usePersistedState("customSpellCards", {});
  const [magicItems, setMagicItems] = usePersistedState("magicItems", magicItemsSeed);

  const [notes, setNotes] = usePersistedState("notes", "");
  const [treasure, setTreasure] = usePersistedState("treasure", treasureSeed);
  const [activeTab, setActiveTab] = usePersistedState("activeTab", TAB_ORDER[0]);

  // Sheet config loads after session state hydrates so it always wins the race.
  useEffect(() => {
    fetchRemoteState().then(() =>
      fetch("/api/config")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
        .then((cfg) => {
          if (!cfg) return;
          if (cfg.classLevel) setClassLevel(cfg.classLevel);
          if (cfg.abilityScores) setAbilityScores(cfg.abilityScores);
          if (cfg.proficiencyBonus != null) setProficiencyBonus(cfg.proficiencyBonus);
          if (cfg.saveProficiencies) setSaveProficiencies(cfg.saveProficiencies);
          if (cfg.skillProficiencies) setSkillProficiencies(cfg.skillProficiencies);
          if (cfg.combatStats) setCombatStats(cfg.combatStats);
          if (cfg.hpMax != null) setHpMax(cfg.hpMax);
          if (cfg.hitDiceBase) setHitDice((prev) => ({ ...prev, count: cfg.hitDiceBase.count, die: cfg.hitDiceBase.die }));
          if (cfg.attacksList) setAttacksList(cfg.attacksList);
          if (cfg.currency) setCurrency(cfg.currency);
          if (cfg.equipmentList) setEquipmentList(cfg.equipmentList);
          if (cfg.featuresList) setFeaturesList(cfg.featuresList);
          if (cfg.spellClasses) setSpellClasses(cfg.spellClasses);
          if (cfg.spellCards) updateSpellCatalog(cfg.spellCards);
        })
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isWide = useMediaQuery("(min-width: 1100px)");

  const cards = [
    ...getCombatCards({
      hpCurrent,
      setHpCurrent,
      hpTemp,
      setHpTemp,
      hpMax,
      hitDice,
      setHitDice,
      deathSaves,
      setDeathSaves,
      combatStats,
      setCombatStats,
      attacksList,
      setAttacksList,
    }),
    ...getAbilitiesCards({
      abilityScores,
      setAbilityScores,
      proficiencyBonus,
      setProficiencyBonus,
      saveProficiencies,
      setSaveProficiencies,
      skillProficiencies,
      setSkillProficiencies,
    }),
    ...getEquipmentCards({ currency, setCurrency, equipmentList, setEquipmentList }),
    ...getFeaturesCards({ featuresList, setFeaturesList }),
    // Big, self-contained, or unusually tall panels carry `wide: true` and
    // render full-width outside the masonry grid (see below) — so a single
    // oversized card can't disrupt column balancing for the smaller ones.
    {
      id: "spells",
      tabGroup: "Spells",
      wide: true,
      content: (
        <SpellsPanel
          spellClasses={spellClasses}
          setSpellClasses={setSpellClasses}
          slotsUsed={slotsUsed}
          setSlotsUsed={setSlotsUsed}
          prepared={prepared}
          setPrepared={setPrepared}
          customCards={customCards}
          setCustomCards={setCustomCards}
          magicItems={magicItems}
          setMagicItems={setMagicItems}
          proficiencyBonus={proficiencyBonus}
        />
      ),
    },
    {
      id: "background",
      tabGroup: "Background",
      wide: true,
      content: <BackgroundPanel notes={notes} setNotes={setNotes} treasure={treasure} setTreasure={setTreasure} />,
    },
  ];

  const visibleAll = isWide ? cards : cards.filter((c) => c.tabGroup === activeTab);
  const visibleCards = visibleAll.filter((c) => !c.wide);
  const visibleWidePanels = visibleAll.filter((c) => c.wide);

  return (
    <div className="app">
      <div className="app__container">
        <Header
          hpCurrent={hpCurrent}
          setHpCurrent={setHpCurrent}
          hpMax={hpMax}
          setHpMax={setHpMax}
          combatStats={combatStats}
          proficiencyBonus={proficiencyBonus}
          classLevel={classLevel}
          setClassLevel={setClassLevel}
          inspiration={inspiration}
          setInspiration={setInspiration}
        />

        {!isWide && <TabNav tabs={TAB_ORDER} active={activeTab} onChange={setActiveTab} size="lg" />}

        {visibleCards.length > 0 && <CardMasonry cards={visibleCards} />}
        {visibleWidePanels.map((p) => (
          <div key={p.id}>{p.content}</div>
        ))}
      </div>
    </div>
  );
}
