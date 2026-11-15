import type { ReactNode } from "react";

export function Ornament({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <span className={`ornament ornament--${align}`} aria-hidden="true">
      <span className="ornament__line" />
      <svg width="22" height="10" viewBox="0 0 22 10">
        <path d="M1 7c2.5-4 5-4 7 0s4.5 4 6.5 0 4.5-4 6.5 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <span className="ornament__line" />
    </span>
  );
}

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  id?: string;
  tone?: "light" | "dark";
}

export function SectionHeading({ eyebrow, title, intro, align = "center", as: H = "h2", id, tone = "light" }: Props) {
  return (
    <header className={`section-heading section-heading--${align} section-heading--${tone} reveal`}>
      <p className="eyebrow">{eyebrow}</p>
      <Ornament align={align} />
      <H id={id} className="display">
        {title}
      </H>
      {intro && <p className="section-heading__intro">{intro}</p>}
    </header>
  );
}
