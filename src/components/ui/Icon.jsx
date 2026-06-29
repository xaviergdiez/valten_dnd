const PATHS = {
  plus: "M6 1v10M1 6h10",
  minus: "M1 6h10",
  close: "M2 2l8 8M10 2l-8 8",
};

// Text glyphs (−, +, ×) render with inconsistent optical centering across
// fonts/browsers. Drawing them as fixed-coordinate SVG paths guarantees they
// sit dead-center in their button regardless of font metrics.
export default function Icon({ name, size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
