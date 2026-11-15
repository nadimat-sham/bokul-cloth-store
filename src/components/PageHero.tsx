import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs.tsx";
import { Ornament } from "./SectionHeading.tsx";

/** Dark title band used at the top of inner pages. */
export function PageHero({ eyebrow, title, intro, crumbs, children }: { eyebrow: string; title: string; intro?: ReactNode; crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero__art" aria-hidden="true" />
      <div className="container page-hero__inner">
        <Breadcrumbs items={crumbs} tone="dark" />
        <p className="eyebrow eyebrow--gold">{eyebrow}</p>
        <Ornament align="left" />
        <h1 className="display page-hero__title">{title}</h1>
        {intro && <p className="page-hero__intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
