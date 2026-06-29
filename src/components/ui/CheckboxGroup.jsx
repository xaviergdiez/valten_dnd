import Checkbox from "./Checkbox";
import "./CheckboxGroup.css";

export default function CheckboxGroup({ label, total, used, onChange }) {
  const handleClick = (index) => {
    // Clicking a filled pip un-uses it (and everything after); clicking an empty
    // pip fills up through it. Mirrors how players tick boxes left-to-right.
    onChange(index < used ? index : index + 1);
  };

  return (
    <div className="checkbox-group">
      <p className="checkbox-group__label">{label}</p>
      <div className="checkbox-group__boxes">
        {Array.from({ length: total }, (_, i) => (
          <Checkbox key={i} selected={i < used} onClick={() => handleClick(i)} label={`Slot ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
