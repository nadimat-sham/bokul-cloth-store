import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Seo, storeLd, websiteLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { useApi } from "../lib/data.tsx";
import { CATEGORIES_KEY, FEATURED_KEY } from "../lib/queries.ts";
import { Ornament, SectionHeading } from "../components/SectionHeading.tsx";
import { ProductGrid } from "../components/ProductCard.tsx";
import { FaqList } from "../components/Faq.tsx";
import { CtaBand } from "../components/CtaBand.tsx";
import { Icon, type IconName } from "../components/Icon.tsx";
import { HOME_FAQS } from "../content/faq.ts";
import { BengaliName, Mandala } from "../components/Logo.tsx";
import { ADDRESS, EXCHANGE_DAYS, PHONE, FREE_SHIPPING_FROM, SHIPPING, STORE, formatMoney } from "../../shared/store.ts";
import type { Category, ProductListResponse } from "../../shared/types.ts";

const PROMISES: { icon: IconName; title: string; text: string }[] = [
  { icon: "cash", title: "Cash on delivery", text: "Pay the courier in cash when your parcel arrives — nothing to pay online." },
  { icon: "truck", title: "Delivery across Bangladesh", text: `${formatMoney(SHIPPING.inside_dhaka.fee)} inside Dhaka, ${formatMoney(SHIPPING.outside_dhaka.fee)} everywhere else in the country.` },
  { icon: "sparkle", title: `Free delivery from ${formatMoney(FREE_SHIPPING_FROM)}`, text: "Spend a little more on a family order and the delivery is on us." },
  { icon: "refresh", title: `${EXCHANGE_DAYS}-day returns & exchanges`, text: "Wrong size? Send unworn items back within a week of delivery." },
  { icon: "phone", title: "A real confirmation call", text: "We call before dispatch to check your size, items and address." },
  { icon: "leaf", title: "Made for our weather", text: "Cottons, lawn and linen blends that stay comfortable through a humid day." },
];

const SIZES = ["S", "M", "L", "XL", "XXL", "Free size", "2-3Y", "4-5Y", "6-7Y", "8-9Y"];
const BUDGETS = [1000, 2000, 3000, 5000];

function QuickFinder({ categories }: { categories: Category[] }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [budget, setBudget] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (size) qs.set("size", size);
    if (budget) qs.set("maxPrice", budget);
    const s = qs.toString();
    navigate(`/shop${category ? `/${category}` : ""}${s ? `?${s}` : ""}`);
  };
  return (
    <form className="finder reveal" onSubmit={submit} action="/shop" method="get" aria-label="Find clothes">
      <div className="finder__fields">
        <div className="finder__field">
          <label htmlFor="f-cat">Category</label>
          <select id="f-cat" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All clothing</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="finder__field">
          <label htmlFor="f-size">Size</label>
          <select id="f-size" name="size" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Any size</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="finder__field">
          <label htmlFor="f-budget">Budget</label>
          <select id="f-budget" name="maxPrice" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Any price</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>Up to {formatMoney(b)}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn--gold finder__submit">Find clothes</button>
      </div>
      <p className="finder__note">
        Cash on delivery anywhere in Bangladesh. Not sure about fit? <Link to="/size-guide">Read our size guide</Link>.
      </p>
    </form>
  );
}

export function HomePage() {
  const site = useSite();
  const cats = useApi<Category[]>(CATEGORIES_KEY).data ?? [];
  const featured = useApi<ProductListResponse>(FEATURED_KEY).data?.products ?? [];
  const designCount = cats.reduce((n, c) => n + c.productCount, 0);

  return (
    <>
      <Seo
        title="BCS — Bokul Cloth Store, Nachole | Sarees, Panjabis & Kids' Wear"
        description={`Shop cotton sarees, three-pieces, kurtis, panjabis, shirts and kids' wear at Bokul Cloth Store, Adhunik Market, Nachole — or online. Cash on delivery across Bangladesh, free delivery from ${formatMoney(FREE_SHIPPING_FROM)} and ${EXCHANGE_DAYS}-day returns.`}
        path="/"
        jsonLd={[storeLd(site), websiteLd(site)]}
      />

      <section className="hero" aria-labelledby="hero-title">
        <picture className="hero__media">
          <img src="/images/scenes/hero.svg" alt="" width={1600} height={1000} fetchPriority="high" decoding="async" />
        </picture>
        <div className="hero__shade" aria-hidden="true" />
        <Mandala className="hero__mandala" />
        <div className="container hero__inner">
          <BengaliName className="hero__bn" label={STORE.bengaliName} />
          <p className="eyebrow eyebrow--gold hero__eyebrow">{ADDRESS.locality}, {ADDRESS.region} · Delivering nationwide</p>
          <Ornament align="left" />
          <h1 id="hero-title" className="display hero__title">
            Clothes That Feel <br className="br-desktop" />
            Like Home
          </h1>
          <p className="hero__text">
            Cotton sarees, block-printed three-pieces, panjabis and kids' wear — chosen for everyday comfort and festive days, delivered to your door with cash on delivery.
          </p>
          <div className="btn-row">
            <Link to="/shop" className="btn btn--gold">Shop the collection</Link>
            <Link to="/shop/women" className="btn btn--ghost-light">Browse women</Link>
          </div>
        </div>
      </section>

      <div className="container finder-wrap">
        <QuickFinder categories={cats} />
      </div>

      <section className="section about-split" aria-labelledby="about-title">
        <div className="container split">
          <figure className="framed reveal">
            <img src="/brand/bokul-logo-original-600.webp" alt="The Bokul Cloth Store logo: the BCS monogram over a mandala with the shop name বকুল ক্লথ ষ্টোর" width={600} height={600} loading="lazy" decoding="async" />
          </figure>
          <div className="split__text">
            <SectionHeading
              align="left"
              eyebrow="About Bokul"
              id="about-title"
              title="Comfortable clothes for every day of the year"
              intro={`${STORE.bengaliName} — known simply as BCS — is run by its proprietor, ${STORE.proprietor} (Bokul), from Adhunik Market in Nachole.`}
            />
            <p className="reveal">
              We stock women's sarees, three-pieces and kurtis, men's panjabis and shirts, children's frocks and sets, and finishing pieces like ornas and gamchas. Every listing tells you the fabric, colour, care and the sizes actually in stock, so you know what you are ordering.
            </p>
            <dl className="stats reveal">
              <div>
                <dt>Designs in stock</dt>
                <dd>{designCount || "—"}</dd>
              </div>
              <div>
                <dt>Days to return</dt>
                <dd>{EXCHANGE_DAYS}</dd>
              </div>
              <div>
                <dt>Pay on delivery</dt>
                <dd>COD</dd>
              </div>
            </dl>
            <Link to="/about" className="link-arrow reveal">
              More about the store <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="promises-title">
        <div className="container">
          <SectionHeading eyebrow="With every order" id="promises-title" title={<>The Essentials, <br className="br-desktop" />Already Included</>} />
          <ul className="promise-grid">
            {PROMISES.map((p) => (
              <li key={p.title} className="promise reveal">
                <span className="promise__icon"><Icon name={p.icon} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <SectionHeading
            eyebrow="Bestsellers"
            id="featured-title"
            title="Pick Your Piece"
            intro="Our most-loved designs right now — each one with its fabric, sizes and stock listed up front."
          />
          <ProductGrid products={featured} />
          <div className="center-row">
            <Link to="/shop" className="btn btn--outline">See all clothing</Link>
          </div>
        </div>
      </section>

      <section className="section section--navy" aria-labelledby="festive-title">
        <div className="container split split--reverse">
          <figure className="framed framed--dark reveal">
            <img src="/images/categories/men.svg" alt="A maroon embroidered Eid panjabi and an oxford shirt on hangers" width={800} height={1000} loading="lazy" decoding="async" />
          </figure>
          <div className="split__text">
            <SectionHeading align="left" tone="dark" eyebrow="Eid & wedding season" id="festive-title" title={<>Dressed for every <br className="br-desktop" />celebration</>} />
            <p className="reveal on-dark">
              From an embroidered maroon panjabi for Eid morning to a midnight georgette saree for a reception, our festive pieces are finished with care and priced for the whole family.
            </p>
            <ul className="chips reveal">
              <li>Embroidered panjabis</li>
              <li>Party sarees</li>
              <li>Kids' sets</li>
            </ul>
            <Link to="/shop/men" className="link-arrow link-arrow--light reveal">
              Shop festive panjabis <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cats-title">
        <div className="container">
          <SectionHeading eyebrow="Shop by category" id="cats-title" title="Something for Everyone" />
          <ul className="category-grid">
            {cats.map((c) => (
              <li key={c.slug} className="reveal">
                <Link to={`/shop/${c.slug}`} className="category-tile">
                  <img src={`/images/categories/${c.slug}.svg`} alt="" width={800} height={1000} loading="lazy" decoding="async" />
                  <span className="category-tile__body">
                    <span className="category-tile__name">{c.name}</span>
                    <span className="category-tile__meta">{c.headline}</span>
                    <span className="category-tile__count">{c.productCount} designs <Icon name="arrow" size={14} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="faq-title">
        <div className="container container--narrow">
          <SectionHeading eyebrow="Before you order" id="faq-title" title="Questions We Get Asked" />
          <FaqList items={HOME_FAQS} />
          <div className="center-row">
            <Link to="/faq" className="btn btn--outline">Read all the answers</Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Find Your Next Favourite Outfit"
        text={`Browse the full ${STORE.name} collection, add what you love to your bag and pay in cash when it reaches your door — or call us on ${PHONE.display}.`}
        primary={{ to: "/shop", label: "Start shopping" }}
        secondary={{ to: "/contact", label: "Ask us a question" }}
      />
    </>
  );
}
