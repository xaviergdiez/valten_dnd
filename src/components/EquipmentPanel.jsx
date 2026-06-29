import SectionCard from "./layout/SectionCard";
import StatRow from "./ui/StatRow";
import Icon from "./ui/Icon";
import NumberInput from "./ui/NumberInput";
import "./EquipmentPanel.css";

function newItemId() {
  return `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function getEquipmentCards({ currency, setCurrency, equipmentList, setEquipmentList }) {
  const toggleEquipped = (id) =>
    setEquipmentList((prev) => prev.map((item) => (item.id === id ? { ...item, equipped: !item.equipped } : item)));
  const updateItem = (id, field) => (e) =>
    setEquipmentList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: e.target.value } : item)));
  const updateQuantity = (id) => (n) =>
    setEquipmentList((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: n } : item)));
  const removeItem = (id) => setEquipmentList((prev) => prev.filter((item) => item.id !== id));
  const addItem = () => setEquipmentList((prev) => [...prev, { id: newItemId(), name: "", quantity: 1, equipped: false }]);

  return [
    {
      id: "currency",
      tabGroup: "Equipment",
      content: (
        <SectionCard title="Currency">
          <StatRow
            cells={Object.entries(currency).map(([code, value]) => ({
              label: code.toUpperCase(),
              value: (
                <NumberInput value={value} onChange={(n) => setCurrency((prev) => ({ ...prev, [code]: n }))} />
              ),
            }))}
          />
        </SectionCard>
      ),
    },
    {
      id: "equipment",
      tabGroup: "Equipment",
      content: (
        <SectionCard title="Equipment">
          <div className="equipment-panel__list">
            {equipmentList.map((item) => (
              <div key={item.id} className="equipment-panel__row">
                <button
                  type="button"
                  className={`equipment-panel__icon ${item.equipped ? "equipment-panel__icon--equipped" : ""}`}
                  onClick={() => toggleEquipped(item.id)}
                  aria-pressed={item.equipped}
                  aria-label={`${item.name} equipped`}
                  title="Toggle equipped"
                />
                <input className="inline-input equipment-panel__name" value={item.name} onChange={updateItem(item.id, "name")} />
                <NumberInput
                  className="inline-input equipment-panel__quantity"
                  value={item.quantity}
                  onChange={updateQuantity(item.id)}
                />
                <button type="button" className="icon-button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-row-button" onClick={addItem}>
            + Add Item
          </button>
        </SectionCard>
      ),
    },
  ];
}
