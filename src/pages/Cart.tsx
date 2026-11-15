import { Link } from "react-router";
import { Seo } from "../lib/seo.tsx";
import { useCart } from "../lib/cart.tsx";
import { useApi } from "../lib/data.tsx";
import { ALL_PRODUCTS_KEY } from "../lib/queries.ts";
import { PageHero } from "../components/PageHero.tsx";
import { QtyStepper } from "../components/QtyStepper.tsx";
import { Icon } from "../components/Icon.tsx";
import { FREE_SHIPPING_FROM, MAX_QTY_PER_LINE, SHIPPING, formatMoney } from "../../shared/store.ts";
import type { ProductListResponse } from "../../shared/types.ts";

/** Current price/stock for each bag line, from live catalogue data. */
export function useBagCheck() {
  const cart = useCart();
  const live = useApi<ProductListResponse>(ALL_PRODUCTS_KEY).data?.products;
  const lines = cart.lines.map((l) => {
    const p = live?.find((x) => x.slug === l.slug);
    const stock = p?.sizes.find((s) => s.size === l.size)?.stock ?? 0;
    const price = p?.price ?? l.price;
    let problem = "";
    if (live && !p) problem = "No longer available — please remove it.";
    else if (live && stock === 0) problem = "Sold out in this size — please remove it.";
    else if (live && stock < l.quantity) problem = `Only ${stock} left — please lower the quantity.`;
    return { ...l, price, stock, problem, image: p?.image ?? l.image, name: p?.name ?? l.name };
  });
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  return { cart, lines, subtotal, hasProblem: lines.some((l) => l.problem), checked: Boolean(live) };
}

export function CartPage() {
  const { cart, lines, subtotal, hasProblem } = useBagCheck();
  const toFree = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  return (
    <>
      <Seo title="Your shopping bag" description="Review the items in your Bokul Cloth Store bag before checkout." path="/cart" noindex />
      <PageHero eyebrow="Your bag" title="Shopping Bag" crumbs={[{ name: "Home", path: "/" }, { name: "Bag", path: "/cart" }]} />
      <section className="section section--tight">
        <div className="container">
          {!cart.ready ? (
            <p className="notice">Loading your bag…</p>
          ) : !lines.length ? (
            <div className="empty">
              <h2 className="display">Your bag is empty</h2>
              <p>Find something you love — every order is cash on delivery.</p>
              <Link to="/shop" className="btn btn--dark">Start shopping</Link>
            </div>
          ) : (
            <div className="checkout-grid">
              <div>
                <ul className="bag-list" aria-label="Items in your bag">
                  {lines.map((l) => (
                    <li key={`${l.slug}-${l.size}`} className="bag-line">
                      <Link to={`/product/${l.slug}`} className="bag-line__img" tabIndex={-1} aria-hidden="true">
                        <img src={l.image} alt="" width={120} height={150} loading="lazy" />
                      </Link>
                      <div className="bag-line__body">
                        <h2 className="bag-line__name"><Link to={`/product/${l.slug}`}>{l.name}</Link></h2>
                        <p className="bag-line__meta">Size {l.size} · {formatMoney(l.price)} each</p>
                        {l.problem && <p className="field__error">{l.problem}</p>}
                        <div className="bag-line__controls">
                          <QtyStepper
                            value={l.quantity}
                            max={Math.max(1, Math.min(MAX_QTY_PER_LINE, l.stock || l.quantity))}
                            onChange={(n) => cart.setQuantity(l.slug, l.size, n)}
                            label={`Quantity of ${l.name}, size ${l.size}`}
                          />
                          <button type="button" className="link-btn" onClick={() => cart.remove(l.slug, l.size)}>
                            <Icon name="trash" size={16} /> Remove<span className="visually-hidden"> {l.name}</span>
                          </button>
                        </div>
                      </div>
                      <p className="bag-line__total">{formatMoney(l.price * l.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <Link to="/shop" className="link-arrow"><Icon name="arrowLeft" size={16} /> Continue shopping</Link>
              </div>
              <aside className="summary" aria-labelledby="summary-title">
                <h2 id="summary-title" className="summary__title">Order summary</h2>
                <dl>
                  <div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>{toFree === 0 ? "Free" : `${formatMoney(SHIPPING.inside_dhaka.fee)} / ${formatMoney(SHIPPING.outside_dhaka.fee)}`}</dd>
                  </div>
                </dl>
                <p className="summary__note">
                  {toFree === 0
                    ? "You've unlocked free delivery anywhere in Bangladesh."
                    : `Inside Dhaka / outside Dhaka. Add ${formatMoney(toFree)} more for free delivery.`}
                </p>
                <Link to="/checkout" className={`btn btn--gold btn--block ${hasProblem ? "is-disabled" : ""}`} aria-disabled={hasProblem || undefined} onClick={(e) => hasProblem && e.preventDefault()}>
                  Checkout
                </Link>
                {hasProblem && <p className="field__error">Please fix the items marked above first.</p>}
                <p className="summary__fine"><Icon name="cash" size={16} /> Pay cash on delivery</p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
