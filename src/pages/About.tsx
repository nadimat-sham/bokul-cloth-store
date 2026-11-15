import { Link } from "react-router";
import { Seo, breadcrumbLd, storeLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { PageHero } from "../components/PageHero.tsx";
import { SectionHeading } from "../components/SectionHeading.tsx";
import { CtaBand } from "../components/CtaBand.tsx";
import { Icon } from "../components/Icon.tsx";
import { ADDRESS_TEXT, EXCHANGE_DAYS, MAPS_URL, PHONE, PHONE_HREF, STORE } from "../../shared/store.ts";

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
            <img src="/brand/bokul-logo-original.webp" alt="The Bokul Cloth Store logo: the BCS monogram over a mandala, the shop name বকুল ক্লথ ষ্টোর, the proprietor's name, phone numbers and the shop address in Bengali" width={1050} height={1050} loading="lazy" />
          </figure>
          <div className="split__text prose">
            <SectionHeading align="left" eyebrow="About BCS" title="Clothing for the whole family, from Nachole" />
            <p className="reveal">
              {STORE.name} ({STORE.bengaliName}) is known to its customers simply as <strong>BCS</strong>. The shop is run by its owner and proprietor, <strong>{STORE.proprietor} (Bokul)</strong>.
            </p>
            <p className="reveal">
              {STORE.name} sells everyday and festive clothing from our shop at Adhunik Market in Nachole and online: cotton and georgette sarees, three-pieces, kurtis and tunics for women; panjabis, shirts, polos and chinos for men; frocks, panjabi sets and tees for kids; and ornas and gamchas to finish an outfit.
            </p>
            <p className="reveal">
              Prefer to see and feel the fabric first? Visit us at <strong>{ADDRESS_TEXT}</strong>.{" "}
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">Get directions</a>
            </p>
          </div>
        </div>
      </section>
      <section className="section section--navy" aria-labelledby="owner-title">
        <div className="container split split--reverse">
          <figure className="framed framed--dark reveal">
            <img
              src="/images/owner/motiur-rahman-800.webp"
              srcSet="/images/owner/motiur-rahman-800.webp 800w, /images/owner/motiur-rahman.webp 1280w"
              sizes="(min-width: 900px) 50vw, 100vw"
              alt={`${STORE.proprietor} (Bokul), owner of ${STORE.name}, in a mustard field with a child`}
              width={1280}
              height={720}
              loading="lazy"
            />
          </figure>
          <div className="split__text">
            <SectionHeading align="left" tone="dark" eyebrow="Meet the owner" id="owner-title" title={`${STORE.proprietor} (Bokul)`} />
            <p className="reveal on-dark">
              {STORE.proprietor} (Bokul) is the owner and proprietor of {STORE.name}, better known as BCS.
            </p>
            <p className="reveal on-dark">
              Drop in at {ADDRESS_TEXT} to say hello, or call <a href={PHONE_HREF} className="on-dark-link">{PHONE.display}</a>.
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
