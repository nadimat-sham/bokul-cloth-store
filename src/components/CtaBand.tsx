import { Link } from "react-router";
import { Ornament } from "./SectionHeading.tsx";

export function CtaBand({ eyebrow = "Ready when you are", title, text, primary, secondary }: {
  eyebrow?: string;
  title: string;
  text: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
}) {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="cta-band__art" aria-hidden="true" />
      <div className="container cta-band__inner reveal">
        <p className="eyebrow eyebrow--gold">{eyebrow}</p>
        <Ornament />
        <h2 id="cta-title" className="display">{title}</h2>
        <p className="cta-band__text">{text}</p>
        <div className="btn-row btn-row--center">
          <Link className="btn btn--gold" to={primary.to}>{primary.label}</Link>
          {secondary && <Link className="btn btn--ghost-light" to={secondary.to}>{secondary.label}</Link>}
        </div>
      </div>
    </section>
  );
}
