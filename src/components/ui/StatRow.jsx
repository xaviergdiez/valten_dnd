import "./StatRow.css";

// The RANGE / COMPONENTS / DURATION / CASTING TIME row from the spell cards,
// generalized: a row of bold-labeled stat cells divided by rules. `value` can
// be a plain string or JSX (e.g. an editable input) for live stats.
export default function StatRow({ cells, size = "md" }) {
  return (
    <div className={`stat-row stat-row--${size}`}>
      {cells.map((cell) => (
        <div key={cell.label} className="stat-row__cell">
          <p className="stat-row__label">{cell.label}</p>
          <div className="stat-row__value">{cell.value}</div>
        </div>
      ))}
    </div>
  );
}
