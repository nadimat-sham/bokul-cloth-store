import { useState } from "react";
import { Link, useParams } from "react-router";
import { Seo, breadcrumbLd, ogPng, productLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { useApi } from "../lib/data.tsx";
import { productKey } from "../lib/queries.ts";
import { useCart } from "../lib/cart.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import { Price } from "../components/Price.tsx";
import { QtyStepper } from "../components/QtyStepper.tsx";
import { ProductGrid } from "../components/ProductCard.tsx";
import { SectionHeading } from "../components/SectionHeading.tsx";
import { Icon } from "../components/Icon.tsx";
import { NotFoundPage } from "./NotFound.tsx";
import { EXCHANGE_DAYS, FREE_SHIPPING_FROM, MAX_QTY_PER_LINE, PHONE, PHONE_HREF, SHIPPING, formatMoney } from "../../shared/store.ts";
import type { Product } from "../../shared/types.ts";

export function ProductPage() {
  const { slug = "" } = useParams();
  const res = useApi<{ product: Product; related: Product[] }>(productKey(slug));
  if (res.status === 404) return <NotFoundPage />;
  if (!res.data) {
    return (
      <div className="container section">
        <p className="notice">{res.error ?? "Loading…"}</p>
      </div>
    );
  }
  return <ProductView key={slug} product={res.data.product} related={res.data.related} />;
}

function ProductView({ product: p, related }: { product: Product; related: Product[] }) {
  const site = useSite();
  const cart = useCart();
  const available = p.sizes.filter((s) => s.stock > 0);
  const [size, setSize] = useState(available.length === 1 ? available[0].size : "");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const stock = p.sizes.find((s) => s.size === size)?.stock ?? 0;
  const inBag = cart.lines.find((l) => l.slug === p.slug && l.size === size)?.quantity ?? 0;
  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_LINE, stock - inBag));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: p.categoryName, path: `/shop/${p.categorySlug}` },
    { name: p.name, path: `/product/${p.slug}` },
  ];

  const addToBag = () => {
    if (!size) return setMessage({ kind: "error", text: "Please choose a size first." });
    if (inBag + qty > stock) return setMessage({ kind: "error", text: `Only ${stock} available in size ${size}${inBag ? ` and ${inBag} already in your bag` : ""}.` });
    cart.add({ slug: p.slug, size, quantity: qty, name: p.name, price: p.price, image: p.image });
    setMessage({ kind: "ok", text: `Added ${qty} × ${p.name} (size ${size}) to your bag.` });
    setQty(1);
  };

  return (
    <>
      <Seo
        title={`${p.name} — ${p.fabric}`}
        description={`${p.summary} ${formatMoney(p.price)} with cash on delivery across Bangladesh. Sizes: ${p.sizes.map((s) => s.size).join(", ")}.`}
        path={`/product/${p.slug}`}
        image={ogPng(p)}
        imageAlt={p.name}
        type="product"
        jsonLd={[productLd(site, p), breadcrumbLd(site, crumbs)]}
      />
      <section className="section section--tight product">
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <div className="product__grid">
            <figure className="framed product__media">
              <img src={p.image} alt={`${p.name} in ${p.color.toLowerCase()} — ${p.fabric.toLowerCase()}`} width={600} height={750} fetchPriority="high" />
            </figure>
            <div className="product__info">
              <p className="eyebrow">{p.categoryName}</p>
              <h1 className="display product__title">{p.name}</h1>
              <p className="product__meta">
                <span>{p.fabric}</span>
                <span>{p.color}</span>
              </p>
              <Price price={p.price} compareAt={p.compareAtPrice} size="lg" />
              <p className="product__summary">{p.summary}</p>

              <fieldset className="sizes">
                <legend>
                  Size {size && <span className="sizes__chosen">— {size}</span>}
                  <Link to="/size-guide" className="sizes__guide">Size guide</Link>
                </legend>
                <div className="sizes__options">
                  {p.sizes.map((s) => (
                    <label key={s.size} className={`size-opt ${s.stock ? "" : "is-out"}`}>
                      <input type="radio" name="size" value={s.size} checked={size === s.size} disabled={!s.stock} onChange={() => { setSize(s.size); setQty(1); setMessage(null); }} />
                      <span>{s.size}</span>
                      {!s.stock && <span className="visually-hidden"> (sold out)</span>}
                    </label>
                  ))}
                </div>
                <p className="sizes__stock" aria-live="polite">
                  {!available.length ? "This design is currently sold out." : size && stock <= 3 ? `Only ${stock} left in size ${size}.` : size ? "In stock — ready to ship." : ""}
                </p>
              </fieldset>

              <div className="buy-row">
                <QtyStepper value={qty} onChange={setQty} max={size ? maxQty : 1} label="Quantity" />
                <button type="button" className="btn btn--gold btn--grow" onClick={addToBag} disabled={!available.length}>
                  <Icon name="bag" size={18} /> {available.length ? "Add to bag" : "Sold out"}
                </button>
              </div>
              <div role="status" aria-live="polite" className="buy-msg">
                {message && (
                  <p className={`notice ${message.kind === "error" ? "notice--error" : "notice--ok"}`}>
                    {message.text}
                    {message.kind === "ok" && (
                      <>
                        {" "}<Link to="/cart">View bag & checkout →</Link>
                      </>
                    )}
                  </p>
                )}
              </div>

              <ul className="assurances">
                <li><Icon name="cash" size={18} /> Cash on delivery — pay when it arrives</li>
                <li><Icon name="truck" size={18} /> Dhaka {SHIPPING.inside_dhaka.days} · elsewhere {SHIPPING.outside_dhaka.days}; free from {formatMoney(FREE_SHIPPING_FROM)}</li>
                <li><Icon name="refresh" size={18} /> {EXCHANGE_DAYS}-day returns & exchanges on unworn items</li>
                <li><Icon name="phone" size={18} /> <span>Questions or prefer to order by phone? Call <a href={PHONE_HREF}>{PHONE.display}</a></span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand section--tight" aria-labelledby="details-title">
        <div className="container details">
          <div>
            <h2 id="details-title" className="display details__title">About this piece</h2>
            <p>{p.description}</p>
          </div>
          <dl className="spec">
            <div><dt>Fabric</dt><dd>{p.fabric}</dd></div>
            <div><dt>Colour</dt><dd>{p.color}</dd></div>
            <div><dt>Sizes</dt><dd>{p.sizes.map((s) => s.size).join(", ")}</dd></div>
            <div><dt>Care</dt><dd>{p.care}</dd></div>
            <div><dt>Payment</dt><dd>Cash on delivery</dd></div>
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-title">
          <div className="container">
            <SectionHeading eyebrow="Complete the look" id="related-title" title="You May Also Like" />
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
