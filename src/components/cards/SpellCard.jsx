import StatRow from "../ui/StatRow";
import "./Cards.css";

export default function SpellCard({ title, cardLevel, school, castTime, range, components, duration, description, muted }) {
  return (
    <div className={`card card--spell ${muted ? "card--muted" : ""}`}>
      <div className="card__banner-row">
        <p className="card__banner">{title}</p>
        <span className="card__token">{cardLevel === "Cantrip" ? "—" : cardLevel}</span>
      </div>
      <StatRow
        size="sm"
        cells={[
          { label: "Range", value: range },
          { label: "Components", value: components },
          { label: "Duration", value: duration },
          { label: "Casting Time", value: castTime },
        ]}
      />
      <p className="card__description">{description}</p>
      <div className="card__footer">
        <p className="card__school">{school}</p>
      </div>
    </div>
  );
}
