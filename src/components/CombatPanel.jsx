import Checkbox from "./ui/Checkbox";
import StatRow from "./ui/StatRow";
import Icon from "./ui/Icon";
import NumberInput from "./ui/NumberInput";
import SectionCard from "./layout/SectionCard";
import "./CombatPanel.css";

function newAttackId() {
  return `atk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function getCombatCards({
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
}) {
  const clampHp = (n) => Math.max(0, Math.min(hpMax, n));
  const updateStat = (key) => (n) => setCombatStats((prev) => ({ ...prev, [key]: n }));

  const updateAttack = (id, field) => (e) =>
    setAttacksList((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: e.target.value } : a)));
  const removeAttack = (id) => setAttacksList((prev) => prev.filter((a) => a.id !== id));
  const addAttack = () =>
    setAttacksList((prev) => [...prev, { id: newAttackId(), name: "", atkBonus: "", damage: "" }]);

  return [
    {
      id: "vitals",
      tabGroup: "Combat",
      content: (
        <SectionCard title="Vitals">
          <StatRow
            cells={[
              { label: "Armor Class", value: <NumberInput value={combatStats.armorClass} onChange={updateStat("armorClass")} /> },
              { label: "Initiative", value: <NumberInput value={combatStats.initiative} onChange={updateStat("initiative")} /> },
              { label: "Speed", value: <NumberInput value={combatStats.speed} onChange={updateStat("speed")} /> },
            ]}
          />

          <div className="combat-panel__hp">
            <div className="combat-panel__hp-row">
              <span>Current HP</span>
              <div className="combat-panel__stepper">
                <button type="button" onClick={() => setHpCurrent(clampHp(hpCurrent - 1))}>
                  <Icon name="minus" />
                </button>
                <NumberInput value={hpCurrent} onChange={(n) => setHpCurrent(clampHp(n))} />
                <button type="button" onClick={() => setHpCurrent(clampHp(hpCurrent + 1))}>
                  <Icon name="plus" />
                </button>
              </div>
              <span className="combat-panel__hp-max">/ {hpMax} (edit max in header)</span>
            </div>
            <div className="combat-panel__hp-row">
              <span>Temp HP</span>
              <div className="combat-panel__stepper">
                <button type="button" onClick={() => setHpTemp(Math.max(0, hpTemp - 1))}>
                  <Icon name="minus" />
                </button>
                <NumberInput value={hpTemp} onChange={(n) => setHpTemp(Math.max(0, n))} />
                <button type="button" onClick={() => setHpTemp(hpTemp + 1)}>
                  <Icon name="plus" />
                </button>
              </div>
            </div>
          </div>

          <div className="combat-panel__hitdice">
            <div className="combat-panel__hitdice-label">
              <span>Hit Dice</span>
              <NumberInput
                className="inline-input combat-panel__hitdice-input"
                value={hitDice.count}
                onChange={(n) => setHitDice((d) => ({ ...d, count: n }))}
              />
              <span>d</span>
              <NumberInput
                className="inline-input combat-panel__hitdice-input"
                value={hitDice.die}
                onChange={(n) => setHitDice((d) => ({ ...d, die: n }))}
              />
            </div>
            <div className="combat-panel__stepper">
              <button type="button" onClick={() => setHitDice((d) => ({ ...d, used: Math.max(0, d.used - 1) }))}>
                <Icon name="minus" />
              </button>
              <span className="combat-panel__hitdice-value">
                {hitDice.count - hitDice.used} / {hitDice.count}
              </span>
              <button
                type="button"
                onClick={() => setHitDice((d) => ({ ...d, used: Math.min(d.count, d.used + 1) }))}
              >
                <Icon name="plus" />
              </button>
            </div>
          </div>

          <div className="combat-panel__deathsaves">
            <span>Death Saves</span>
            <div className="combat-panel__deathsaves-row">
              <span className="combat-panel__deathsaves-label">Successes</span>
              {[0, 1, 2].map((i) => (
                <Checkbox
                  key={i}
                  selected={i < deathSaves.successes}
                  onClick={() => setDeathSaves((d) => ({ ...d, successes: i < d.successes ? i : i + 1 }))}
                  label={`Success ${i + 1}`}
                />
              ))}
            </div>
            <div className="combat-panel__deathsaves-row">
              <span className="combat-panel__deathsaves-label">Failures</span>
              {[0, 1, 2].map((i) => (
                <Checkbox
                  key={i}
                  selected={i < deathSaves.failures}
                  onClick={() => setDeathSaves((d) => ({ ...d, failures: i < d.failures ? i : i + 1 }))}
                  label={`Failure ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </SectionCard>
      ),
    },
    {
      id: "attacks",
      tabGroup: "Combat",
      content: (
        <SectionCard title="Attacks & Spellcasting">
          <table className="combat-panel__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Atk Bonus</th>
                <th>Damage / Type</th>
                <th aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              {attacksList.map((a) => (
                <tr key={a.id}>
                  <td>
                    <input className="inline-input" value={a.name} onChange={updateAttack(a.id, "name")} />
                  </td>
                  <td>
                    <input className="inline-input" value={a.atkBonus} onChange={updateAttack(a.id, "atkBonus")} />
                  </td>
                  <td>
                    <input className="inline-input" value={a.damage} onChange={updateAttack(a.id, "damage")} />
                  </td>
                  <td>
                    <button type="button" className="icon-button" onClick={() => removeAttack(a.id)} aria-label={`Remove ${a.name}`}>
                      <Icon name="close" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="add-row-button" onClick={addAttack}>
            + Add Attack
          </button>
        </SectionCard>
      ),
    },
  ];
}
