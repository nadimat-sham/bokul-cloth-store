import { Link } from "react-router";
import type { Product } from "../../shared/types.ts";
import { discountPercent } from "../../shared/store.ts";
import { Price } from "./Price.tsx";

export function ProductCard({ product: p, headingLevel = 3, eager = false }: { product: Product; headingLevel?: 2 | 3; eager?: boolean }) {
  const H = `h${headingLevel}` as const;
  const inStock = p.sizes.filter((s) => s.stock > 0);
  const off = discountPercent(p.price, p.compareAtPrice);
  return (
    <article className="product-card reveal">
      <Link to={`/product/${p.slug}`} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <img src={p.image} alt="" width={600} height={750} loading={eager ? "eager" : "lazy"} decoding="async" />
        {!inStock.length ? (
          <span className="tag tag--muted">Sold out</span>
        ) : off > 0 ? (
          <span className="tag">Save {off}%</span>
        ) : p.featured ? (
          <span className="tag tag--sage">Bestseller</span>
        ) : null}
      </Link>
      <div className="product-card__body">
        <H className="product-card__title">
          <Link to={`/product/${p.slug}`}>{p.name}</Link>
        </H>
        <p className="product-card__meta">
          <span>{p.categoryName}</span>
          <span>{p.fabric}</span>
        </p>
        <p className="product-card__summary">{p.summary}</p>
        <div className="product-card__foot">
          <Price price={p.price} compareAt={p.compareAtPrice} />
          <p className="product-card__sizes">
            {inStock.length ? `Sizes: ${inStock.map((s) => s.size).join(" · ")}` : "Currently out of stock"}
          </p>
        </div>
        <Link to={`/product/${p.slug}`} className="btn btn--dark btn--block">
          Choose size<span className="visually-hidden"> for {p.name}</span>
        </Link>
      </div>
    </article>
  );
}

export function ProductGrid({ products, eagerFirst = 0, headingLevel = 3 }: { products: Product[]; eagerFirst?: number; headingLevel?: 2 | 3 }) {
  return (
    <div className="product-grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} eager={i < eagerFirst} headingLevel={headingLevel} />
      ))}
    </div>
  );
}
