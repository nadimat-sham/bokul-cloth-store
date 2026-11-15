import { Seo, breadcrumbLd, faqLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { PageHero } from "../components/PageHero.tsx";
import { FaqList } from "../components/Faq.tsx";
import { CtaBand } from "../components/CtaBand.tsx";
import { ALL_FAQS, FAQ_GROUPS } from "../content/faq.ts";

export function FaqPage() {
  const site = useSite();
  const crumbs = [{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }];
  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="Answers about ordering, cash on delivery, delivery charges and times, returns, sizing and contacting Bokul Cloth Store."
        path="/faq"
        jsonLd={[faqLd(ALL_FAQS), breadcrumbLd(site, crumbs)]}
      />
      <PageHero eyebrow="Help centre" title="Frequently Asked Questions" crumbs={crumbs} intro="Everything about ordering, delivery, returns and sizing in one place." />
      <section className="section">
        <div className="container faq-layout">
          <nav className="faq-toc" aria-label="FAQ topics">
            <p className="eyebrow">Topics</p>
            <ul>
              {FAQ_GROUPS.map((g) => (
                <li key={g.id}><a href={`#${g.id}`}>{g.title}</a></li>
              ))}
            </ul>
          </nav>
          <div>
            {FAQ_GROUPS.map((g) => (
              <section key={g.id} id={g.id} className="faq-group" aria-labelledby={`${g.id}-h`}>
                <h2 id={`${g.id}-h`} className="display faq-group__title">{g.title}</h2>
                <FaqList items={g.items} openFirst={false} />
              </section>
            ))}
          </div>
        </div>
      </section>
      <CtaBand eyebrow="Still wondering?" title="Ask Us Anything" text="If your question isn't answered here, send us a message — we reply within one working day." primary={{ to: "/contact", label: "Contact us" }} secondary={{ to: "/shop", label: "Browse the shop" }} />
    </>
  );
}
