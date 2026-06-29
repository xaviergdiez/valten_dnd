import StatRow from "./ui/StatRow";
import NumberInput from "./ui/NumberInput";
import "./Header.css";

export default function Header({
  hpCurrent,
  setHpCurrent,
  hpMax,
  setHpMax,
  combatStats,
  proficiencyBonus,
  classLevel,
  setClassLevel,
  inspiration,
  setInspiration,
}) {
  return (
    <header className="header">
      <div className="header__portrait">
        <img src="/valten-avatar.jpg" alt="Valten" />
      </div>
      <div className="header__identity">
        <h1 className="header__name">
          Valten <span className="header__nickname">"The Gentle Giant"</span>
        </h1>
        <p className="header__subline">
          Human Undead &bull;{" "}
          <input
            className="inline-input header__classlevel-input"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            aria-label="Class and level"
          />
        </p>
        <label className="header__inspiration">
          <input type="checkbox" checked={inspiration} onChange={(e) => setInspiration(e.target.checked)} />
          Inspiration
        </label>
      </div>
      <StatRow
        cells={[
          { label: "AC", value: combatStats.armorClass },
          {
            label: "Health",
            value: (
              <span className="header__hp-edit">
                <NumberInput
                  value={hpCurrent}
                  onChange={(n) => setHpCurrent(Math.max(0, Math.min(hpMax, n)))}
                  aria-label="Current hit points"
                />
                <span>/</span>
                <NumberInput value={hpMax} onChange={(n) => setHpMax(Math.max(1, n))} aria-label="Max hit points" />
              </span>
            ),
          },
          { label: "Initiative", value: combatStats.initiative },
          { label: "Speed", value: `${combatStats.speed} ft` },
          { label: "Prof. Bonus", value: `+${proficiencyBonus}` },
        ]}
      />
    </header>
  );
}
