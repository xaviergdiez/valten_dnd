import StatRow from "./ui/StatRow";
import NumberInput from "./ui/NumberInput";
import { avatarPlaceholder } from "../data/character";
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
  setCharacterProfile,
  avatarUrls,
  isGeneratingAvatar,
}) {
  const name = characterProfile?.characterName || "Character";
  const cropUrl = avatarUrls?.crop;
  const updateProfile = (field) => (e) =>
    setCharacterProfile((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <header className="header">
      <div className={`header__portrait ${isGeneratingAvatar ? "header__portrait--generating" : ""}`}>
        <img
          src={cropUrl || avatarPlaceholder}
          onError={(e) => { e.target.onerror = null; e.target.src = avatarPlaceholder; }}
          alt={name}
        />
        {isGeneratingAvatar && (
          <span className="header__portrait-overlay" aria-label="Generating avatar">
            <span className="header__portrait-spinner" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="header__identity">
        <h1 className="header__name">
          <input
            className="inline-input header__name-input"
            value={characterProfile?.characterName ?? ""}
            onChange={updateProfile("characterName")}
            placeholder="Character name"
            aria-label="Character name"
          />
          <input
            className="inline-input header__nickname-input"
            value={characterProfile?.nickname ?? ""}
            onChange={updateProfile("nickname")}
            placeholder="nickname"
            aria-label="Nickname"
          />
        </h1>
        <p className="header__subline">
          <input
            className="inline-input header__race-input"
            value={characterProfile?.race ?? ""}
            onChange={updateProfile("race")}
            placeholder="Race"
            aria-label="Race"
          />
          {" • "}
          <input
            className="inline-input header__classlevel-input"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            placeholder="Class & level"
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
