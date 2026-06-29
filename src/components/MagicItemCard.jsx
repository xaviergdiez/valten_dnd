import SectionCard from "./layout/SectionCard";
import Icon from "./ui/Icon";
import "./MagicItemCard.css";

export default function MagicItemCard({ item, proficiencyBonus, onUpdate, onRemove }) {
  const maxCharges = item.chargeMultiplier ? item.chargeMultiplier * proficiencyBonus : null;
  const used = item.chargesUsed ?? 0;

  const setField = (field) => (e) => onUpdate((prev) => ({ ...prev, [field]: e.target.value }));
  const setUsed = (n) => onUpdate((prev) => ({ ...prev, chargesUsed: Math.max(0, Math.min(maxCharges, n)) }));

  return (
    <SectionCard
      title={<input value={item.title} onChange={setField("title")} />}
      corner={
        <button type="button" className="icon-button" onClick={onRemove} aria-label={`Remove ${item.title}`}>
          <Icon name="close" />
        </button>
      }
      className="magic-item-card"
    >
      <input
        className="inline-input magic-item-card__subtitle"
        value={item.subtitle || ""}
        onChange={setField("subtitle")}
        placeholder="Subtitle (e.g. Magic Item)"
      />
      <textarea
        className="inline-input magic-item-card__description"
        value={item.description || ""}
        onChange={setField("description")}
        placeholder="What does it do?"
      />

      {maxCharges !== null && (
        <div className="magic-item-card__charges">
          <span>Charges ({item.chargeMultiplier} × Prof. Bonus)</span>
          <div className="magic-item-card__stepper">
            <button type="button" onClick={() => setUsed(used - 1)}>
              <Icon name="minus" />
            </button>
            <span className="magic-item-card__charges-value">
              {maxCharges - used} / {maxCharges}
            </span>
            <button type="button" onClick={() => setUsed(used + 1)}>
              <Icon name="plus" />
            </button>
          </div>
        </div>
      )}

      {item.features?.length > 0 && (
        <ul className="magic-item-card__features">
          {item.features.map((f) => (
            <li key={f.name}>
              <span className="magic-item-card__feature-name">
                {f.name}
                {f.level && <span className="magic-item-card__feature-level"> (Lv. {f.level}+)</span>}
                {f.cost && <span className="magic-item-card__feature-cost"> — {f.cost} charge{f.cost === 1 ? "" : "s"}</span>}
              </span>
              <span className="magic-item-card__feature-effect">{f.effect}</span>
            </li>
          ))}
        </ul>
      )}

      {item.bonusProgression?.length > 0 && (
        <div className="magic-item-card__progression">
          <p className="magic-item-card__progression-title">Bonus progression (level gating not yet finalized)</p>
          <ul>
            {item.bonusProgression.map((p) => (
              <li key={p.atLevel}>
                {p.atLevel}: {p.bonus}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.regain && <p className="magic-item-card__regain">{item.regain}</p>}
    </SectionCard>
  );
}
