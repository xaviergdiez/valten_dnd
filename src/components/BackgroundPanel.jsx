import { useRef, useState } from "react";
import {
  appearance,
  backstory,
  personality,
  allies,
  undeadCondition,
  proficienciesLanguages,
} from "../data/character";
import Cell from "./ui/Cell";
import Icon from "./ui/Icon";
import SectionCard from "./layout/SectionCard";
import "./BackgroundPanel.css";

const TABS = ["Backstory", "Proficiencies & Languages", "Notes"];

export default function BackgroundPanel({ notes, setNotes, treasure, setTreasure, avatarUrls, characterProfile, onGenerateAvatar, isGeneratingAvatar, avatarError }) {
  const [tab, setTab] = useState("Backstory");
  const dialogRef = useRef(null);

  const openConfirm = () => dialogRef.current?.showModal();
  const closeConfirm = () => dialogRef.current?.close();
  const confirmGenerate = () => { closeConfirm(); onGenerateAvatar(); };

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
                src={avatarUrls?.full || "/valten-full.jpg"}
                onError={(e) => { e.target.onerror = null; e.target.src = "/valten-full.jpg"; }}
                alt={characterProfile?.characterName || "Character, full body"}
              />
            </div>
            <button
              type="button"
              className="background-panel__regen-btn"
              onClick={openConfirm}
              disabled={isGeneratingAvatar}
            >
              {isGeneratingAvatar ? "Generating…" : "↺ Regenerate Avatar"}
            </button>
            {avatarError && (
              <p className="background-panel__avatar-error">{avatarError}</p>
            )}
          </div>

          <dialog ref={dialogRef} className="background-panel__confirm-dialog">
            <p className="background-panel__confirm-title">Generate new avatar?</p>
            <p className="background-panel__confirm-body">
              This will create a new portrait for{" "}
              <strong>{characterProfile?.characterName || "your character"}</strong> using Gemini AI.
              Each generation uses API credits.
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
            <p className="background-panel__paragraph">{backstory}</p>
            <p className="background-panel__paragraph">{characterProfile?.description || appearance.description}</p>

            <div className="background-panel__grid">
              <div>
                <p className="background-panel__label">Age</p>
                <p>{appearance.age}</p>
              </div>
              <div>
                <p className="background-panel__label">Height</p>
                <p>{appearance.height}</p>
              </div>
              <div>
                <p className="background-panel__label">Weight</p>
                <p>{appearance.weight}</p>
              </div>
              <div>
                <p className="background-panel__label">Eyes</p>
                <p>{appearance.eyes}</p>
              </div>
              <div>
                <p className="background-panel__label">Skin</p>
                <p>{appearance.skin}</p>
              </div>
              <div>
                <p className="background-panel__label">Hair</p>
                <p>{appearance.hair}</p>
              </div>
            </div>
          </div>

          <div className="background-panel__cards">
            <SectionCard title="Personality">
              <p>
                <strong>Traits:</strong> {personality.traits}
              </p>
              <p>
                <strong>Ideals:</strong> {personality.ideals}
              </p>
              <p>
                <strong>Bonds:</strong> {personality.bonds}
              </p>
              <p>
                <strong>Flaws:</strong> {personality.flaws}
              </p>
            </SectionCard>

            <SectionCard title="Allies & Organizations">
              {allies.map((a) => (
                <p key={a.name}>
                  <strong>{a.name}:</strong> {a.description}
                </p>
              ))}
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

            <SectionCard title={undeadCondition.title}>
              <ul className="background-panel__list">
                {undeadCondition.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "Proficiencies & Languages" && (
        <div className="background-panel__cells">
          <Cell label="Languages" sublabel={proficienciesLanguages.languages.join(", ")} />
          <Cell label="Tools" sublabel={proficienciesLanguages.tools.join(", ")} />
          <Cell label="Armor & Weapons" sublabel={proficienciesLanguages.armorWeapons.join(", ")} />
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
