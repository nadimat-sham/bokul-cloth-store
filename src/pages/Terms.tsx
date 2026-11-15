import { Link } from "react-router";
import { LegalPage } from "./Legal.tsx";
import { useSite } from "../lib/site.tsx";
import { EXCHANGE_DAYS, FREE_SHIPPING_FROM, SHIPPING, STORE, formatMoney } from "../../shared/store.ts";

export function TermsPage() {
  const site = useSite();
  return (
    <LegalPage
      title="Terms & Conditions"
      path="/terms"
      description="The terms that apply when you browse and order from Bokul Cloth Store: orders, pricing, cash on delivery, delivery, returns and liability."
      intro="Please read these terms before placing an order. Placing an order means you accept them."
    >
      <h2>1. About these terms</h2>
      <p>These terms apply to your use of the {STORE.name} website and to every order you place on it. “We”, “us” and “our” mean {STORE.name}; “you” means the person using the site or placing an order.</p>

      <h2>2. Orders</h2>
      <ul>
        <li>When you place an order you receive an order number on screen and by email. This confirms we have <em>received</em> your order — it is accepted once we confirm it with you by phone.</li>
        <li>We may decline or cancel an order if an item is out of stock, the price was shown incorrectly, we cannot reach you to confirm, or we suspect a fraudulent or abusive order. If we cancel, you pay nothing.</li>
        <li>You can change or cancel your order free of charge until it has been dispatched by contacting us with your order number.</li>
      </ul>

      <h2>3. Products and prices</h2>
      <ul>
        <li>We describe each product's fabric, colour, care and sizes as accurately as we can. Colours can look different on different screens, and hand block prints and handloom weaves naturally vary slightly between pieces.</li>
        <li>Prices are in Bangladeshi taka (BDT). The price you pay is the price shown when you placed the order, plus the delivery charge shown at checkout.</li>
        <li>Stock is limited. Items are reserved for you only once your order has been placed successfully.</li>
      </ul>

      <h2>4. Payment</h2>
      <p>All orders are paid in cash on delivery. Please pay the courier the total shown in your confirmation email. We never ask for card, PIN or mobile-banking passwords.</p>

      <h2>5. Delivery</h2>
      <p>We deliver across {STORE.country}. Delivery costs {formatMoney(SHIPPING.inside_dhaka.fee)} inside Dhaka city and {formatMoney(SHIPPING.outside_dhaka.fee)} elsewhere, and is free for orders of {formatMoney(FREE_SHIPPING_FROM)} or more. Delivery times are estimates; delays caused by couriers, holidays or events outside our control do not make us liable, but we will keep you informed. If you refuse a parcel without a valid reason, we may ask you to pay the delivery charge before accepting future orders.</p>

      <h2>6. Returns, exchanges and refunds</h2>
      <p>You may return or exchange unworn, unwashed items with their tags attached within {EXCHANGE_DAYS} days of delivery, as set out on our <Link to="/delivery-returns">Delivery &amp; returns</Link> page. Faulty or incorrect items are always replaced or refunded at our cost. Nothing in these terms limits any rights you have under the consumer protection laws of Bangladesh.</p>

      <h2>7. Using this website</h2>
      <ul>
        <li>Don't misuse the site — for example by placing fake orders, attempting to access the admin area, or interfering with its security or operation.</li>
        <li>The text, designs, images and logo on this site belong to {STORE.name} and may not be copied for commercial use without our permission.</li>
      </ul>

      <h2>8. Liability</h2>
      <p>We are responsible for losses that are a foreseeable result of us breaking these terms, up to the value of your order. We are not responsible for indirect losses, or for delays or failures caused by events outside our reasonable control.</p>

      <h2>9. Changes to these terms</h2>
      <p>We may update these terms from time to time. The version on this page when you place your order applies to that order.</p>

      <h2>10. Governing law and contact</h2>
      <p>These terms are governed by the laws of the People's Republic of Bangladesh. Questions? <Link to="/contact">Contact us</Link>{site.email ? <> or email <a href={`mailto:${site.email}`}>{site.email}</a></> : null}.</p>
    </LegalPage>
  );
}
