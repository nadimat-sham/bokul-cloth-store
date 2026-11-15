import { Link } from "react-router";

/** The bokul blossom — a star of narrow petals around a small centre. */
export function BokulMark({ size = 40, color = "#c9a25a", centre = "#f6f1e7" }: { size?: number; color?: string; centre?: string }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g fill={color}>
        {petals.map((a) => (
          <ellipse key={a} cx="32" cy="17.7" rx="3.4" ry="11.7" transform={`rotate(${a} 32 32)`} />
        ))}
      </g>
      <circle cx="32" cy="32" r="5.2" fill={centre} />
    </svg>
  );
}

export function Logo({ variant = "light", compact = false }: { variant?: "light" | "dark"; compact?: boolean }) {
  return (
    <Link to="/" className={`logo logo--${variant}${compact ? " logo--compact" : ""}`} aria-label={compact ? "Bokul Cloth Store home" : undefined}>
      <BokulMark size={compact ? 34 : 40} centre={variant === "light" ? "#13202d" : "#f6f1e7"} />
      {!compact && (
        <span className="logo__text">
          <span className="logo__name">Bokul</span> <span className="logo__sub">Cloth Store</span>
        </span>
      )}
    </Link>
  );
}
