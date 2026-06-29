import { abilityNames, abilityModifier, skillsSeed } from "../data/character";
import ModifierBadge from "./ui/ModifierBadge";
import Checkbox from "./ui/Checkbox";
import NumberInput from "./ui/NumberInput";
import SectionCard from "./layout/SectionCard";
import "./AbilitiesPanel.css";

export default function getAbilitiesCards({
  abilityScores,
  setAbilityScores,
  proficiencyBonus,
  setProficiencyBonus,
  saveProficiencies,
  setSaveProficiencies,
  skillProficiencies,
  setSkillProficiencies,
}) {
  const toggleSave = (key) => setSaveProficiencies((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleSkill = (name) => setSkillProficiencies((prev) => ({ ...prev, [name]: !prev[name] }));

  const perceptionMod =
    abilityModifier(abilityScores.wis) + (skillProficiencies["Perception"] ? proficiencyBonus : 0);

  return [
    {
      id: "skills",
      tabGroup: "Abilities & Skills",
      wide: true,
      content: (
        <SectionCard title="Skills">
          <p className="abilities-panel__hint">Passive Wisdom (Perception): {10 + perceptionMod}</p>
          <ul className="abilities-panel__list abilities-panel__list--columns">
            {skillsSeed.map((s) => {
              const proficient = skillProficiencies[s.name];
              const total = abilityModifier(abilityScores[s.ability]) + (proficient ? proficiencyBonus : 0);
              return (
                <li key={s.name} className="abilities-panel__row">
                  <Checkbox selected={!!proficient} onClick={() => toggleSkill(s.name)} label={`${s.name} proficient`} />
                  <span className="abilities-panel__name">
                    {s.name} <span className="abilities-panel__ability-tag">({s.ability})</span>
                  </span>
                  <ModifierBadge value={total} />
                </li>
              );
            })}
          </ul>
        </SectionCard>
      ),
    },
    {
      id: "saving-throws",
      tabGroup: "Abilities & Skills",
      content: (
        <SectionCard title="Saving Throws">
          <p className="abilities-panel__hint">Proficiency Bonus +{proficiencyBonus}</p>
          <ul className="abilities-panel__list">
            {Object.entries(abilityNames).map(([key, name]) => {
              const proficient = saveProficiencies[key];
              const total = abilityModifier(abilityScores[key]) + (proficient ? proficiencyBonus : 0);
              return (
                <li key={key} className="abilities-panel__row">
                  <Checkbox selected={!!proficient} onClick={() => toggleSave(key)} label={`${name} save proficient`} />
                  <span className="abilities-panel__name">{name}</span>
                  <ModifierBadge value={total} />
                </li>
              );
            })}
          </ul>
        </SectionCard>
      ),
    },
    {
      id: "ability-scores",
      tabGroup: "Abilities & Skills",
      content: (
        <SectionCard title="Ability Scores">
          <div className="abilities-panel__prof-row">
            <span>Proficiency Bonus</span>
            <NumberInput
              className="inline-input abilities-panel__prof-input"
              value={proficiencyBonus}
              onChange={setProficiencyBonus}
            />
          </div>
          <ul className="abilities-panel__list">
            {Object.entries(abilityNames).map(([key, name]) => (
              <li key={key} className="abilities-panel__row">
                <span className="abilities-panel__name">{name}</span>
                <NumberInput
                  className="inline-input abilities-panel__score-input"
                  value={abilityScores[key]}
                  onChange={(n) => setAbilityScores((prev) => ({ ...prev, [key]: n }))}
                />
                <ModifierBadge value={abilityModifier(abilityScores[key])} />
              </li>
            ))}
          </ul>
        </SectionCard>
      ),
    },
  ];
}
