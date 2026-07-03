import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Icon from "./ui/Icon";
import "./SpellPicker.css";

const SpellPicker = forwardRef(function SpellPicker({ database = [], levelFilter, onPick, onCustom }, ref) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");

  useImperativeHandle(ref, () => ({
    open() {
      setQuery("");
      dialogRef.current?.showModal();
    },
  }));

  const close = () => dialogRef.current?.close();

  const filtered = database.filter((s) => {
    const matchesLevel = !levelFilter || s.cardLevel?.toLowerCase() === levelFilter.toLowerCase();
    const matchesQuery = !query || s.name.toLowerCase().includes(query.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  const pick = (spell) => { close(); onPick(spell); };
  const custom = () => { close(); onCustom(); };

  return (
    <dialog ref={dialogRef} className="spell-picker">
      <div className="spell-picker__head">
        <input
          className="spell-picker__search inline-input"
          placeholder="Search spells…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="button" className="icon-button" onClick={close} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      <ul className="spell-picker__list">
        {filtered.map((s) => (
          <li key={s.name}>
            <button type="button" className="spell-picker__item" onClick={() => pick(s)}>
              <span className="spell-picker__item-name">{s.name}</span>
              {s.cardLevel && <span className="spell-picker__item-level">{s.cardLevel}</span>}
              {s.school && <span className="spell-picker__item-school">{s.school}</span>}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="spell-picker__empty">
            {query ? `No spells match "${query}"` : "No spells in database"}
          </li>
        )}
      </ul>
      <div className="spell-picker__footer">
        <button type="button" className="add-row-button" onClick={custom}>
          + Custom spell
        </button>
      </div>
    </dialog>
  );
});

export default SpellPicker;
