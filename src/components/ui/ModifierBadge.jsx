import "./ModifierBadge.css";

export default function ModifierBadge({ value }) {
  const sign = value >= 0 ? "+" : "-";
  return (
    <div className="modifier-badge">
      {sign}
      {Math.abs(value)}
    </div>
  );
}
