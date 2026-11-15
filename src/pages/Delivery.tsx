import { Link } from "react-router";
import { Seo, breadcrumbLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { PageHero } from "../components/PageHero.tsx";
import { EXCHANGE_DAYS, FREE_SHIPPING_FROM, SHIPPING, formatMoney } from "../../shared/store.ts";

export function DeliveryPage() {
  const site = useSite();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Delivery & returns", path: "/delivery-returns" }];
  return (
    <>
      <Seo
        title="Delivery & Returns"
        description={`Delivery charges and times across Bangladesh, free delivery from ${formatMoney(FREE_SHIPPING_FROM)}, cash on delivery and our ${EXCHANGE_DAYS}-day return and exchange policy.`}
        path="/delivery-returns"
        jsonLd={[breadcrumbLd(site, crumbs)]}
      />
      <PageHero eyebrow="Customer care" title="Delivery & Returns" crumbs={crumbs} intro="How we deliver, what it costs, and how to send something back." />
      <section className="section">
        <div className="container container--narrow prose">
          <h2>Delivery charges & times</h2>
          <div className="table-wrap">
            <table>
              <caption className="visually-hidden">Delivery charges by area</caption>
              <thead>
                <tr><th scope="col">Area</th><th scope="col">Charge</th><th scope="col">Usual time after confirmation</th></tr>
              </thead>
              <tbody>
                {Object.values(SHIPPING).map((z) => (
                  <tr key={z.label}><th scope="row">{z.label}</th><td>{formatMoney(z.fee)}</td><td>{z.days}</td></tr>
                ))}
                <tr><th scope="row">Any order from {formatMoney(FREE_SHIPPING_FROM)}</th><td>Free</td><td>As above</td></tr>
              </tbody>
            </table>
          </div>
          <p>Delivery times are estimates and can be longer during Eid, national holidays or severe weather. We call to confirm every order before it is dispatched.</p>

          <h2>Payment</h2>
          <p>All orders are <strong>cash on delivery</strong>. Please check the parcel in front of the courier and pay the total shown in your confirmation email.</p>

          <h2>Returns & exchanges</h2>
          <ul>
            <li>You can return or exchange items within <strong>{EXCHANGE_DAYS} days of delivery</strong>.</li>
            <li>Items must be unworn, unwashed and have their original tags attached.</li>
            <li>If an item is faulty or we sent the wrong one, we cover delivery both ways. Otherwise the return delivery charge is paid by you.</li>
            <li>Refunds are sent by mobile banking or bank transfer within 7 working days of us receiving and checking the item.</li>
          </ul>

          <h2>How to start a return</h2>
          <ol>
            <li><Link to="/contact">Contact us</Link> with your order number and the item(s) you want to return or exchange.</li>
            <li>We'll confirm and tell you how to send the parcel back.</li>
            <li>Once it arrives and is checked, we send the exchange or the refund.</li>
          </ol>
        </div>
      </section>
    </>
  );
}
