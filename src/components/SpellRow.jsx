import { useState } from "react";
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

  const alwaysPrepared = card?.alwaysPrepared;
  const isCustom = !card && !!onChangeCustomCard;

  return (
    <div className="spell-row">
      <div className="spell-row__header">
        {alwaysPrepared ? (
          <Checkbox selected disabled label={`${name} always prepared`} />
        ) : (
          onTogglePrepared && <Checkbox selected={!!prepared} onClick={onTogglePrepared} label={`${name} prepared`} />
        )}
        <button
          type="button"
          className="spell-row__expand"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <span className={`spell-row__chevron ${expanded ? "spell-row__chevron--open" : ""}`}>⌄</span>
        </button>
        {onRename ? (
          <input
            className="inline-input spell-row__name-input"
            value={name}
            onChange={(e) => onRename(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="spell-row__name">{name}</span>
        )}
        {alwaysPrepared && <span className="spell-row__always">always prepared</span>}
        {(card || customCard)?.cardLevel && <span className="spell-row__level">{(card || customCard).cardLevel}</span>}
        {onRemove && (
          <button type="button" className="icon-button" onClick={onRemove} aria-label={`Remove ${name}`}>
            <Icon name="close" />
          </button>
        )}
      </div>
      {expanded && (
        <div className="spell-row__detail">
          {card ? (
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
