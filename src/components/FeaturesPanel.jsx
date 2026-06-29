import SectionCard from "./layout/SectionCard";
import Icon from "./ui/Icon";
import "./FeaturesPanel.css";

function newFeatId() {
  return `feat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function getFeaturesCards({ featuresList, setFeaturesList }) {
  const updateFeat = (id, field) => (e) =>
    setFeaturesList((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: e.target.value } : f)));
  const removeFeat = (id) => setFeaturesList((prev) => prev.filter((f) => f.id !== id));
  const addFeat = () =>
    setFeaturesList((prev) => [...prev, { id: newFeatId(), title: "New Feature", source: "", description: "" }]);

  const cards = featuresList.map((f) => ({
    id: f.id,
    tabGroup: "Features",
    content: (
      <SectionCard
        title={<input value={f.title} onChange={updateFeat(f.id, "title")} />}
        corner={
          <button type="button" className="icon-button" onClick={() => removeFeat(f.id)} aria-label={`Remove ${f.title}`}>
            <Icon name="close" />
          </button>
        }
      >
        <input
          className="inline-input features-panel__source"
          value={f.source}
          onChange={updateFeat(f.id, "source")}
          placeholder="Source"
        />
        <textarea className="inline-input features-panel__description" value={f.description} onChange={updateFeat(f.id, "description")} />
      </SectionCard>
    ),
  }));

  cards.push({
    id: "add-feature",
    tabGroup: "Features",
    content: (
      <button type="button" className="add-row-button features-panel__add" onClick={addFeat}>
        + Add Feature
      </button>
    ),
  });

  return cards;
}
