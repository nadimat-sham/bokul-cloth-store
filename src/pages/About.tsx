import { Link } from "react-router";
import { Seo, breadcrumbLd, storeLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { PageHero } from "../components/PageHero.tsx";
import { SectionHeading } from "../components/SectionHeading.tsx";
import { CtaBand } from "../components/CtaBand.tsx";
import { Icon } from "../components/Icon.tsx";
import { EXCHANGE_DAYS, STORE } from "../../shared/store.ts";

export function AboutPage() {
  const site = useSite();
  const crumbs = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }];
  return (
    <>
      <Seo
        title="About Us"
        description="Bokul Cloth Store is an online clothing shop in Bangladesh for comfortable everyday and festive wear — honest product details, cash on delivery and easy returns."
        path="/about"
        jsonLd={[storeLd(site), breadcrumbLd(site, crumbs)]}
      />
      <PageHero eyebrow="Our story" title="About Bokul" crumbs={crumbs} intro="Simple, comfortable clothing for the whole family, sold honestly and delivered across Bangladesh." />
      <section className="section">
        <div className="container split">
          <figure className="framed reveal">
            <img src="/images/categories/women.svg" alt="An ivory jamdani-weave saree and a rose-print kurti on hangers" width={800} height={1000} loading="lazy" />
          </figure>
          <div className="split__text prose">
            <SectionHeading align="left" eyebrow="Why “Bokul”" title="Named after a small flower with a big fragrance" />
            <p className="reveal">
              The bokul flower is tiny and cream-coloured, but its scent fills a whole courtyard and lingers long after it falls. We wanted our clothes to feel the same way — modest and easy to wear, yet something you keep reaching for.
            </p>
            <p className="reveal">
              {STORE.name} sells everyday and festive clothing online: cotton and georgette sarees, three-pieces, kurtis and tunics for women; panjabis, shirts, polos and chinos for men; frocks, panjabi sets and tees for kids; and ornas and gamchas to finish an outfit.
            </p>
          </div>
        </div>
      </section>
      <section className="section section--sand">
        <div className="container">
          <SectionHeading eyebrow="How we work" title="Three Promises We Keep" />
          <ul className="promise-grid promise-grid--three">
            <li className="promise reveal">
              <span className="promise__icon"><Icon name="ruler" /></span>
              <h3>Honest product details</h3>
              <p>Every listing shows the fabric, colour, care instructions and the exact sizes in stock — no guessing.</p>
            </li>
            <li className="promise reveal">
              <span className="promise__icon"><Icon name="cash" /></span>
              <h3>Pay only when it arrives</h3>
              <p>All orders are cash on delivery. We never ask for card or mobile-banking details on this website.</p>
            </li>
            <li className="promise reveal">
              <span className="promise__icon"><Icon name="refresh" /></span>
              <h3>Easy returns</h3>
              <p>If something isn't right, send unworn items back within {EXCHANGE_DAYS} days for an exchange or refund. <Link to="/delivery-returns">Read the policy</Link>.</p>
            </li>
          </ul>
        </div>
      </section>
      <CtaBand title="Come and Take a Look" text="Browse the collection — every design lists its fabric, sizes and stock." primary={{ to: "/shop", label: "Shop the collection" }} secondary={{ to: "/contact", label: "Get in touch" }} />
    </>
  );
}
