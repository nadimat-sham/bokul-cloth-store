import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useParams, useSearchParams } from "react-router";
import { Seo, breadcrumbLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { useApi } from "../lib/data.tsx";
import { CATEGORIES_KEY, productsKey, shopParams } from "../lib/queries.ts";
import { PageHero } from "../components/PageHero.tsx";
import { ProductGrid } from "../components/ProductCard.tsx";
import { Icon } from "../components/Icon.tsx";
import { NotFoundPage } from "./NotFound.tsx";
import { EXCHANGE_DAYS, FREE_SHIPPING_FROM, formatMoney } from "../../shared/store.ts";
import type { Category, ProductListResponse } from "../../shared/types.ts";

const SORTS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const TITLES: Record<string, { title: string; seo: string }> = {
  women: { title: "Women's Clothing", seo: "Women's Sarees, Three-Pieces & Kurtis" },
  men: { title: "Men's Clothing", seo: "Men's Panjabis, Shirts & Chinos" },
  kids: { title: "Kids' Clothing", seo: "Kids' Frocks, Panjabi Sets & Tees" },
  accessories: { title: "Accessories", seo: "Ornas & Handloom Gamchas" },
};

export function ShopPage() {
  const site = useSite();
  const { category } = useParams();
  const [search, setSearch] = useSearchParams();
  const params = shopParams(search, category);
  const cats = useApi<Category[]>(CATEGORIES_KEY);
  const list = useApi<ProductListResponse>(productsKey(params));
  const [q, setQ] = useState(params.q ?? "");
  useEffect(() => setQ(params.q ?? ""), [params.q]);

  const cat = category ? cats.data?.find((c) => c.slug === category) : undefined;
  if (category && cats.data && !cat) return <NotFoundPage />;

  const filtered = Boolean(params.q || params.size || params.maxPrice || params.sort);
  const path = category ? `/shop/${category}` : "/shop";
  const t = category ? TITLES[category] ?? { title: cat?.name ?? "Shop", seo: cat?.name ?? "Shop" } : { title: "All Clothing", seo: "Clothing for Women, Men & Kids" };
  const crumbs = [{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, ...(cat ? [{ name: cat.name, path }] : [])];
  const products = list.data?.products ?? [];

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearch(next, { preventScrollReset: true });
  };
  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    update("q", q.trim());
  };
  const sizes = Array.from(new Set((cat ? products : products).flatMap((p) => p.sizes.map((s) => s.size))));
  if (params.size && !sizes.includes(params.size)) sizes.push(params.size);

  return (
    <>
      <Seo
        title={params.q ? `Search: ${params.q}` : `${t.seo} Online in Bangladesh`}
        description={
          cat
            ? `${cat.description} Shop ${cat.name.toLowerCase()} online at Bokul Cloth Store with cash on delivery across Bangladesh and ${EXCHANGE_DAYS}-day returns.`
            : `Browse every design at Bokul Cloth Store — sarees, three-pieces, kurtis, panjabis, shirts, kids' wear and accessories. Cash on delivery nationwide, free delivery from ${formatMoney(FREE_SHIPPING_FROM)}.`
        }
        path={path}
        noindex={filtered}
        jsonLd={[
          breadcrumbLd(site, crumbs),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t.title,
            url: `${site.url}${path}`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/product/${p.slug}`, name: p.name })),
            },
          },
        ]}
      />
      <PageHero eyebrow={cat ? cat.headline : "The full collection"} title={t.title} crumbs={crumbs} intro={cat?.description ?? "Everyday and festive clothing for women, men and kids, with the fabric, sizes and stock listed for every design."} />

      <section className="section section--tight">
        <div className="container">
          <nav className="cat-tabs" aria-label="Categories">
            <NavLink to="/shop" end className="cat-tab">All</NavLink>
            {(cats.data ?? []).map((c) => (
              <NavLink key={c.slug} to={`/shop/${c.slug}`} className="cat-tab">
                {c.name}
              </NavLink>
            ))}
          </nav>

          <div className="toolbar">
            <form className="toolbar__search" role="search" onSubmit={submitSearch}>
              <label htmlFor="shop-q" className="visually-hidden">Search clothing</label>
              <input id="shop-q" type="search" name="q" placeholder="Search e.g. cotton, panjabi, blue" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="icon-btn" aria-label="Search">
                <Icon name="search" />
              </button>
            </form>
            <div className="toolbar__filters">
              <label className="select-label">
                <span>Size</span>
                <select value={params.size ?? ""} onChange={(e) => update("size", e.target.value)}>
                  <option value="">Any</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="select-label">
                <span>Sort</span>
                <select value={params.sort ?? ""} onChange={(e) => update("sort", e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="results-bar" aria-live="polite">
            <p>
              {list.loading ? "Loading…" : `${products.length} design${products.length === 1 ? "" : "s"}`}
              {params.q && <> for “{params.q}”</>}
              {params.size && <> in size {params.size}</>}
              {params.maxPrice && <> up to {formatMoney(Number(params.maxPrice))}</>}
            </p>
            {filtered && (
              <Link to={path} className="link-arrow">Clear filters</Link>
            )}
          </div>

          {list.error && <p className="notice notice--error">{list.error}</p>}
          {!list.loading && !products.length ? (
            <div className="empty">
              <h2 className="display">Nothing matches yet</h2>
              <p>Try a different size or search word, or browse the full collection.</p>
              <Link to="/shop" className="btn btn--dark">See all clothing</Link>
            </div>
          ) : (
            <ProductGrid products={products} eagerFirst={3} headingLevel={2} />
          )}
        </div>
      </section>

      <section className="section section--sand section--tight">
        <div className="container info-strip">
          <p><Icon name="cash" /> <span><strong>Cash on delivery</strong> anywhere in Bangladesh</span></p>
          <p><Icon name="truck" /> <span><strong>Free delivery</strong> on orders from {formatMoney(FREE_SHIPPING_FROM)}</span></p>
          <p><Icon name="refresh" /> <span><strong>{EXCHANGE_DAYS}-day returns</strong> — <Link to="/delivery-returns">see the policy</Link></span></p>
        </div>
      </section>
    </>
  );
}
