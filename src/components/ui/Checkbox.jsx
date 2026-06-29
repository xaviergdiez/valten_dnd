import "./Checkbox.css";

export default function Checkbox({ selected, onClick, label, disabled }) {
  return (
    <button
      type="button"
      className={`checkbox ${selected ? "checkbox--selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={label}
    />
  );
}
