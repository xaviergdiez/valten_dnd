import { useRef, useState } from "react";
import { avatarPlaceholder } from "../data/character";
import Icon from "./ui/Icon";
import SectionCard from "./layout/SectionCard";
import "./BackgroundPanel.css";

const TABS = ["Backstory", "Proficiencies & Languages", "Notes"];

const APPEARANCE_FIELDS = [
  ["age", "Age"],
  ["height", "Height"],
  ["weight", "Weight"],
  ["eyes", "Eyes"],
  ["skin", "Skin"],
  ["hair", "Hair"],
];

const PERSONALITY_FIELDS = [
  ["traits", "Traits"],
  ["ideals", "Ideals"],
  ["bonds", "Bonds"],
  ["flaws", "Flaws"],
];

const PROFICIENCY_FIELDS = [
  ["languages", "Languages"],
  ["tools", "Tools"],
  ["armorWeapons", "Armor & Weapons"],
];

export default function BackgroundPanel({
  notes,
  setNotes,
  treasure,
  setTreasure,
  avatarUrls,
  characterProfile,
  setCharacterProfile,
  background,
  setBackground,
  onGenerateAvatar,
  isGeneratingAvatar,
  avatarError,
  credits = 0,
  needsCredits,
  onBuyCredits,
}) {
  const [tab, setTab] = useState("Backstory");
  const dialogRef = useRef(null);

  const openConfirm = () => dialogRef.current?.showModal();
  const closeConfirm = () => dialogRef.current?.close();
  const confirmGenerate = () => { closeConfirm(); onGenerateAvatar(); };

  const updateProfile = (field) => (e) =>
    setCharacterProfile((prev) => ({ ...prev, [field]: e.target.value }));
  const updateBackground = (field) => (e) =>
    setBackground((prev) => ({ ...prev, [field]: e.target.value }));

  const updateTreasure = (index) => (e) =>
    setTreasure((prev) => prev.map((t, i) => (i === index ? e.target.value : t)));
  const removeTreasure = (index) => setTreasure((prev) => prev.filter((_, i) => i !== index));
  const addTreasure = () => setTreasure((prev) => [...prev, ""]);

  return (
    <SectionCard className="background-panel">
      <div className="background-panel__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`background-panel__tab ${tab === t ? "background-panel__tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Backstory" && (
        <div className="background-panel__backstory">
          <div className="background-panel__portrait-wrap">
            <div className="background-panel__portrait">
              <img
                src={avatarUrls?.full || avatarPlaceholder}
                onError={(e) => { e.target.onerror = null; e.target.src = avatarPlaceholder; }}
                alt={characterProfile?.characterName || "Character, full body"}
              />
            </div>
            <button
              type="button"
              className="background-panel__regen-btn"
              onClick={openConfirm}
              disabled={isGeneratingAvatar}
            >
              {isGeneratingAvatar ? "Generating…" : "✦ Generate Avatar"}
            </button>
            {needsCredits ? (
              <div className="background-panel__avatar-error">
                <p>You're out of avatar credits.</p>
                <button type="button" className="background-panel__buy-btn" onClick={onBuyCredits}>
                  Buy 10 credits — €3
                </button>
              </div>
            ) : (
              avatarError && <p className="background-panel__avatar-error">{avatarError}</p>
            )}
          </div>

          <dialog ref={dialogRef} className="background-panel__confirm-dialog">
            <p className="background-panel__confirm-title">Generate new avatar?</p>
            <p className="background-panel__confirm-body">
              This will create a new portrait for{" "}
              <strong>{characterProfile?.characterName || "your character"}</strong> using AI,
              based on the description below. You have <strong>{credits}</strong> credit
              {credits === 1 ? "" : "s"} left.
            </p>
            <div className="background-panel__confirm-actions">
              <button type="button" className="background-panel__confirm-cancel" onClick={closeConfirm}>
                Cancel
              </button>
              <button type="button" className="background-panel__confirm-ok" onClick={confirmGenerate}>
                Generate ✦
              </button>
            </div>
          </dialog>

          <div className="background-panel__backstory-text">
            <textarea
              className="background-panel__textarea"
              value={background?.backstory ?? ""}
              onChange={updateBackground("backstory")}
              placeholder="Where does your character come from? Write their backstory here…"
              rows={8}
            />
            <textarea
              className="background-panel__textarea"
              value={characterProfile?.description ?? ""}
              onChange={updateProfile("description")}
              placeholder="Physical appearance — this is also the prompt used for AI avatar generation…"
              rows={5}
            />

            <div className="background-panel__grid">
              {APPEARANCE_FIELDS.map(([field, label]) => (
                <div key={field}>
                  <p className="background-panel__label">{label}</p>
                  <input
                    className="inline-input"
                    value={characterProfile?.[field] ?? ""}
                    onChange={updateProfile(field)}
                    aria-label={label}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="background-panel__cards">
            <SectionCard title="Personality">
              {PERSONALITY_FIELDS.map(([field, label]) => (
                <p key={field} className="background-panel__field-row">
                  <strong>{label}:</strong>{" "}
                  <input
                    className="inline-input"
                    value={background?.[field] ?? ""}
                    onChange={updateBackground(field)}
                    aria-label={label}
                  />
                </p>
              ))}
            </SectionCard>

            <SectionCard title="Allies & Organizations">
              <textarea
                className="background-panel__textarea"
                value={background?.allies ?? ""}
                onChange={updateBackground("allies")}
                placeholder="Factions, patrons, and allies…"
                rows={4}
              />
            </SectionCard>

            <SectionCard title="Treasure">
              <div className="background-panel__editable-list">
                {treasure.map((t, i) => (
                  <div key={i} className="background-panel__editable-row">
                    <input className="inline-input" value={t} onChange={updateTreasure(i)} />
                    <button type="button" className="icon-button" onClick={() => removeTreasure(i)} aria-label="Remove treasure item">
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="add-row-button" onClick={addTreasure}>
                + Add Treasure
              </button>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "Proficiencies & Languages" && (
        <div className="background-panel__cells">
          {PROFICIENCY_FIELDS.map(([field, label]) => (
            <div key={field} className="background-panel__prof-field">
              <p className="background-panel__label">{label}</p>
              <input
                className="inline-input"
                value={background?.[field] ?? ""}
                onChange={updateBackground(field)}
                placeholder="Comma-separated"
                aria-label={label}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "Notes" && (
        <textarea
          className="background-panel__notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes go here…"
        />
      )}
    </SectionCard>
  );
}
