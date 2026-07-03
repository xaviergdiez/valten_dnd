import { useRef, useState } from "react";
import Checkbox from "./ui/Checkbox";
import Icon from "./ui/Icon";
import SpellCard from "./cards/SpellCard";
import EditableSpellCard from "./cards/EditableSpellCard";
import "./SpellRow.css";

export default function SpellRow({
  name,
  card,
  customCard,
  onChangeCustomCard,
  prepared,
  onTogglePrepared,
  onRename,
  onRemove,
  defaultExpanded,
}) {
  const [expanded, setExpanded] = useState(!!defaultExpanded);
  const [editingName, setEditingName] = useState(false);
  const inputRef = useRef(null);

  const alwaysPrepared = card?.alwaysPrepared;
  const isCustom = !card && !!onChangeCustomCard;

  const toggle = () => setExpanded((e) => !e);
  const stop = (e) => e.stopPropagation();

  const [editing, setEditing] = useState(false);

  const startEditing = (e) => {
    e.stopPropagation();
    setEditing(true);
    setExpanded(true);
    setEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopEditing = () => {
    setEditing(false);
    setEditingName(false);
  };

  return (
    <div className="spell-row">
      <div className="spell-row__header" onClick={toggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && toggle()}>
        {alwaysPrepared ? (
          <span onClick={stop}><Checkbox selected disabled label={`${name} always prepared`} /></span>
        ) : (
          onTogglePrepared && (
            <span onClick={stop}>
              <Checkbox selected={!!prepared} onClick={onTogglePrepared} label={`${name} prepared`} />
            </span>
          )
        )}
        <span className={`spell-row__chevron ${expanded ? "spell-row__chevron--open" : ""}`} aria-hidden="true">
          <Icon name="chevron" size={16} />
        </span>
        {onRename && editingName ? (
          <input
            ref={inputRef}
            className="inline-input spell-row__name-input"
            value={name}
            onChange={(e) => onRename(e.target.value)}
            onClick={stop}
            onBlur={() => setEditingName(false)}
          />
        ) : (
          <span className="spell-row__name">{name}</span>
        )}
        {alwaysPrepared && <span className="spell-row__always">always prepared</span>}
        {(card || customCard)?.cardLevel && <span className="spell-row__level">{(card || customCard).cardLevel}</span>}
        <span className="spell-row__actions" onClick={stop}>
          {onRename && (
            <button type="button" className="icon-button" onClick={startEditing} aria-label={`Edit ${name}`}>
              <Icon name="edit" />
            </button>
          )}
          {onRemove && (
            <button type="button" className="icon-button" onClick={onRemove} aria-label={`Remove ${name}`}>
              <Icon name="close" />
            </button>
          )}
        </span>
      </div>
      {expanded && (
        <div className="spell-row__detail">
          {editing && onChangeCustomCard ? (
            <EditableSpellCard
              card={customCard ?? card}
              onChange={onChangeCustomCard}
              onDone={stopEditing}
            />
          ) : card ? (
            <SpellCard {...card} />
          ) : isCustom ? (
            <EditableSpellCard card={customCard} onChange={onChangeCustomCard} onDone={() => setExpanded(false)} />
          ) : (
            <p className="spell-row__missing">No card on file for this spell.</p>
          )}
        </div>
      )}
    </div>
  );
}
