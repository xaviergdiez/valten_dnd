import "./Cell.css";

export default function Cell({ label, sublabel, trailing }) {
  return (
    <div className="cell">
      <div className="cell__leading">
        <p className="cell__label">{label}</p>
        {sublabel && <p className="cell__sublabel">{sublabel}</p>}
      </div>
      {trailing !== undefined && <div className="cell__trailing">{trailing}</div>}
    </div>
  );
}
