import { useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { useLiveEvents } from "../lib/live.ts";
import { Seo } from "../lib/seo.tsx";
import { useApi } from "../lib/data.tsx";
import { orderKey } from "../lib/queries.ts";
import { PageHero } from "../components/PageHero.tsx";
import { Icon } from "../components/Icon.tsx";
import { PHONE, PHONE_HREF, SHIPPING, STATUS_LABEL, formatMoney } from "../../shared/store.ts";
import type { Order, OrderStatus } from "../../shared/types.ts";

const STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export function OrderPage() {
  const { orderNumber = "" } = useParams();
  const [search] = useSearchParams();
  const token = search.get("token") ?? "";
  const justPlaced = Boolean((useLocation().state as { justPlaced?: boolean } | null)?.justPlaced);
  const res = useApi<Order>(token ? orderKey(orderNumber, token) : null);
  const order = res.data;
  const crumbs = [{ name: "Home", path: "/" }, { name: `Order ${orderNumber}`, path: `/order/${orderNumber}` }];
  const notFound = !token || res.status === 404;
  const [update, setUpdate] = useState("");
  // Live: when the store changes this order's status, refresh it in place
  const live = useLiveEvents(order ? `/api/orders/${encodeURIComponent(orderNumber)}/events?token=${encodeURIComponent(token)}` : null, (e) => {
    if (e.type !== "order.updated") return;
    res.reload();
    setUpdate(`Status updated: ${STATUS_LABEL[e.status]}`);
  });

  return (
    <>
      <Seo title={`Order ${orderNumber}`} description="Your Bokul Cloth Store order status." path={`/order/${orderNumber}`} noindex status={notFound ? 404 : 200} />
      <PageHero
        eyebrow={order ? STATUS_LABEL[order.status] : "Order status"}
        title={justPlaced ? "Thank You for Your Order" : `Order ${orderNumber}`}
        crumbs={crumbs}
        intro={
          order
            ? justPlaced
              ? `Your order number is ${order.orderNumber}. We've emailed a confirmation to ${order.email} and will call ${order.phone} to confirm before dispatch. ধন্যবাদ, আবার আসবেন!`
              : `Placed on ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`
            : undefined
        }
      />
      <section className="section section--tight">
        <div className="container">
          {notFound ? (
            <div className="empty">
              <h2 className="display">We couldn't find that order</h2>
              <p>Please open the link from your confirmation email, or contact us with your order number.</p>
              <Link to="/contact" className="btn btn--dark">Contact us</Link>
            </div>
          ) : !order ? (
            <p className="notice">{res.error ?? "Loading your order…"}</p>
          ) : (
            <div className="checkout-grid">
              <div>
                <p className="live-note" role="status" aria-live="polite">
                  <span className={`live-dot live-dot--${live}`} aria-hidden="true" />
                  {update || (live === "live" ? "This page updates automatically when your order status changes." : "Refresh to see the latest status.")}
                </p>
                {order.status === "cancelled" ? (
                  <p className="notice notice--error">This order was cancelled. If that's unexpected, please contact us.</p>
                ) : (
                  <ol className="timeline" aria-label="Order progress">
                    {STEPS.map((s, i) => {
                      const reached = STEPS.indexOf(order.status) >= i;
                      return (
                        <li key={s} className={reached ? "is-done" : ""} aria-current={order.status === s ? "step" : undefined}>
                          <span className="timeline__dot">{reached && <Icon name="check" size={14} />}</span>
                          {STATUS_LABEL[s]}
                        </li>
                      );
                    })}
                  </ol>
                )}
                <ul className="bag-list">
                  {order.items.map((i) => (
                    <li key={`${i.productSlug}-${i.size}`} className="bag-line">
                      <span className="bag-line__img"><img src={i.image} alt="" width={120} height={150} /></span>
                      <div className="bag-line__body">
                        <h2 className="bag-line__name"><Link to={`/product/${i.productSlug}`}>{i.productName}</Link></h2>
                        <p className="bag-line__meta">Size {i.size} · {i.quantity} × {formatMoney(i.unitPrice)}</p>
                      </div>
                      <p className="bag-line__total">{formatMoney(i.lineTotal)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="summary">
                <h2 className="summary__title">Summary</h2>
                <dl>
                  <div><dt>Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>{order.shippingFee ? formatMoney(order.shippingFee) : "Free"}</dd></div>
                  <div className="summary__total"><dt>Total (cash on delivery)</dt><dd>{formatMoney(order.total)}</dd></div>
                </dl>
                <h3 className="summary__sub">Delivering to</h3>
                <p className="summary__addr">
                  {order.customerName}<br />{order.address}<br />{order.city}<br />{order.phone}
                </p>
                <p className="summary__fine">{SHIPPING[order.deliveryZone].label}: usually {SHIPPING[order.deliveryZone].days} after confirmation.</p>
                <a href={PHONE_HREF} className="btn btn--gold btn--block">
                  <Icon name="phone" size={16} /> Call {PHONE.display}
                </a>
                <Link to="/contact" className="btn btn--outline btn--block summary__second">Questions? Contact us</Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
