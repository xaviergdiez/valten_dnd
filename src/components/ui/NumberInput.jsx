import { useEffect, useState } from "react";

// A plain controlled <input type="number"> that always coerces "" to 0
// fights the user: clear the field and it instantly snaps back to "0"
// before they can type a replacement. This keeps the field's own draft text
// so it can sit empty (or as a bare "-") while typing, only committing a
// parsed number up to the parent once it's valid, and reverting to the last
// committed value on blur if left empty/invalid.
export default function NumberInput({ value, onChange, className, ...props }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setText(raw);
    if (raw === "" || raw === "-") return;
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    if (Number.isNaN(parseInt(text, 10))) setText(String(value));
  };

  return (
    <input type="number" className={className} value={text} onChange={handleChange} onBlur={handleBlur} {...props} />
  );
}
