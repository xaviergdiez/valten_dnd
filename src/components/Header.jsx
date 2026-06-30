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
  characterProfile,
  avatarUrls,
  isGeneratingAvatar,
}) {
  const name = characterProfile?.characterName || "Character";
  const nickname = characterProfile?.nickname;
  const race = characterProfile?.race || "";
  const cropUrl = avatarUrls?.crop;

  return (
    <header className="header">
      <div className={`header__portrait ${isGeneratingAvatar ? "header__portrait--generating" : ""}`}>
        <img
          src={cropUrl || "/valten-avatar.jpg"}
          alt={name}
        />
        {isGeneratingAvatar && (
          <span className="header__portrait-overlay" aria-hidden="true">…</span>
        )}
      </div>

      <div className="header__identity">
        <h1 className="header__name">
          {name}
          {nickname && <span className="header__nickname"> "{nickname}"</span>}
        </h1>
        <p className="header__subline">
          {race && <>{race} &bull; </>}
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
