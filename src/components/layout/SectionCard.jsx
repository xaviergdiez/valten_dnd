import "./SectionCard.css";

export default function SectionCard({ title, corner, className = "", children }) {
  return (
    <section className={`section-card ${className}`}>
      {corner && <div className="section-card__corner">{corner}</div>}
      {title && <h2 className="section-card__title">{title}</h2>}
      <div className="section-card__body">{children}</div>
    </section>
  );
}
