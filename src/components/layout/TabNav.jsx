import "./TabNav.css";

export default function TabNav({ tabs, active, onChange, size = "md" }) {
  return (
    <div className={`tab-nav tab-nav--${size}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={tab === active}
          className={`tab-nav__tab ${tab === active ? "tab-nav__tab--active" : ""}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
