import { Link } from "react-router";
import { LegalPage } from "./Legal.tsx";
import { telHref, useSite } from "../lib/site.tsx";
import { STORE } from "../../shared/store.ts";

export function PrivacyPage() {
  const site = useSite();
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      description="How Bokul Cloth Store collects, uses and protects the personal information you share when you order, contact us or subscribe."
      intro="We collect only what we need to deliver your order and answer your questions — and we never sell it."
    >
      <h2>Who we are</h2>
      <p>{STORE.name} ({site.address}) runs this website and is responsible for the personal information collected through it.{" "}You can reach us on <a href={telHref(site.phone)}>{site.phone}</a>{site.email ? <> or at <a href={`mailto:${site.email}`}>{site.email}</a></> : null}.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>When you order:</strong> your name, mobile number, email address, delivery address, any order note, and the items you bought.</li>
        <li><strong>When you contact us:</strong> your name, email, optional phone number and your message.</li>
        <li><strong>When you subscribe:</strong> your email address.</li>
        <li><strong>Your shopping bag</strong> is stored only in your own browser (local storage) until you place an order.</li>
        <li>Our server keeps short technical logs (such as IP address and request time) to keep the site secure and prevent abuse.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To confirm, deliver and support your order, including calling you to confirm it and sending order emails.</li>
        <li>To reply to your messages.</li>
        <li>To send occasional newsletter emails if you subscribed — reply to any of them or contact us to unsubscribe.</li>
        <li>To protect the site from fraud and abuse.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>We share your name, phone number and address with our delivery courier only so they can deliver your parcel. Our emails are sent through Google's email service. We do not sell or rent your personal information to anyone.</p>

      <h2>Cookies and analytics</h2>
      <p>The shop itself does not use advertising cookies. A single security cookie is used for the store's own admin sign-in. If we enable Google Analytics to understand how visitors use the site, it sets its own cookies to measure visits in aggregate.</p>

      <h2>How long we keep it</h2>
      <p>We keep order records for as long as needed for delivery, returns and our accounting obligations, and contact messages for up to two years. Newsletter addresses are kept until you unsubscribe.</p>

      <h2>Your choices</h2>
      <p>You can ask us to show, correct or delete the personal information we hold about you, or to stop sending you newsletters, by <Link to="/contact">contacting us</Link>. We will respond within 30 days.</p>

      <h2>Security</h2>
      <p>The site is designed to be served over HTTPS, our admin area is password protected, and we never ask for payment card or mobile-banking details online.</p>

      <h2>Changes</h2>
      <p>If we change this policy we will update the date at the top of this page.</p>
    </LegalPage>
  );
}
