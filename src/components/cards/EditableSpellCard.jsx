import StatRow from "../ui/StatRow";
import "./Cards.css";

const BLANK = { cardLevel: "", school: "", castTime: "", range: "", components: "", duration: "", description: "" };

// The spell's name is already editable in the row header above this — this
// form only covers the rest of the card. Renders inline where the read-only
// SpellCard normally would, and collapses back to the same compact row via
// onDone once the player is happy with it.
export default function EditableSpellCard({ card, onChange, onDone }) {
  const data = { ...BLANK, ...card };
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="card card--spell card--authoring">
      <div className="card__authoring-level">
        <label>Level</label>
        <input value={data.cardLevel} onChange={update("cardLevel")} placeholder="Cantrip / 1 / 2…" />
      </div>
      <StatRow
        size="sm"
        cells={[
          { label: "Range", value: <input value={data.range} onChange={update("range")} placeholder="60 ft" /> },
          { label: "Components", value: <input value={data.components} onChange={update("components")} placeholder="V, S" /> },
          { label: "Duration", value: <input value={data.duration} onChange={update("duration")} placeholder="Instantaneous" /> },
          { label: "Casting Time", value: <input value={data.castTime} onChange={update("castTime")} placeholder="1 Action" /> },
        ]}
      />
      <textarea
        className="inline-input card__description"
        value={data.description}
        onChange={update("description")}
        placeholder="What does it do?"
      />
      <div className="card__footer">
        <input className="card__school" value={data.school} onChange={update("school")} placeholder="School" />
        <button type="button" className="add-row-button" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
