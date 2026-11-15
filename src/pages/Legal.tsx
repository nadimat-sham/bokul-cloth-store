import type { ReactNode } from "react";
import { Seo, breadcrumbLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { PageHero } from "../components/PageHero.tsx";

export const LEGAL_UPDATED = "15 November 2026";

export function LegalPage({ title, path, description, intro, children }: { title: string; path: string; description: string; intro: string; children: ReactNode }) {
  const site = useSite();
  const crumbs = [{ name: "Home", path: "/" }, { name: title, path }];
  return (
    <>
      <Seo title={title} description={description} path={path} type="article" jsonLd={[breadcrumbLd(site, crumbs)]} />
      <PageHero eyebrow="Legal" title={title} crumbs={crumbs} intro={intro} />
      <section className="section">
        <div className="container container--narrow prose legal">
          <p className="legal__updated">Last updated: {LEGAL_UPDATED}</p>
          {children}
        </div>
      </section>
    </>
  );
}
