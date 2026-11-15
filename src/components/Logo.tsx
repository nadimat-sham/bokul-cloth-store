import { Link } from "react-router";
import { STORE } from "../../shared/store.ts";

// Brand artwork traced from the official logo (public/brand/*.svg). The shapes
// are used as CSS masks so they take the surrounding text colour.

interface BrandProps {
  className?: string;
  /** Accessible name; omit for purely decorative use. */
  label?: string;
}

function BrandShape({ kind, className = "", label }: BrandProps & { kind: "bcs" | "bn" | "mandala" }) {
  return (
    <span
      className={`brand-shape brand-shape--${kind} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/** The "BCS" monogram with its swoosh. */
export const BcsMark = (p: BrandProps) => <BrandShape kind="bcs" {...p} />;
/** The Bengali wordmark "বকুল ক্লথ ষ্টোর". */
export const BengaliName = (p: BrandProps) => <BrandShape kind="bn" {...p} />;
/** The half-mandala ornament from the logo (decorative). */
export const Mandala = (p: BrandProps) => <BrandShape kind="mandala" {...p} />;

export function Logo({ variant = "light", compact = false }: { variant?: "light" | "dark"; compact?: boolean }) {
  return (
    <Link to="/" className={`logo logo--${variant}${compact ? " logo--compact" : ""}`} aria-label={compact ? `${STORE.name} home` : undefined}>
      <BcsMark className="logo__mark" />
      {!compact && (
        <span className="logo__text">
          <span className="logo__name">Bokul</span> <span className="logo__sub">Cloth Store</span>
        </span>
      )}
    </Link>
  );
}
