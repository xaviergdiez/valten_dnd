import "./CardMasonry.css";

export default function CardMasonry({ cards }) {
  return (
    <div className="card-masonry">
      {cards.map((card) => (
        <div key={card.id} className="card-masonry__item">
          {card.content}
        </div>
      ))}
    </div>
  );
}
