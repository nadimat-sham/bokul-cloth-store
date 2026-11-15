import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Seo, breadcrumbLd, storeLd } from "../lib/seo.tsx";
import { useSite, telHref } from "../lib/site.tsx";
import { api, ApiRequestError } from "../lib/api.ts";
import { PageHero } from "../components/PageHero.tsx";
import { Field, TextArea } from "../components/Field.tsx";
import { Icon } from "../components/Icon.tsx";
import { MAPS_URL, STORE } from "../../shared/store.ts";
import type { ContactRequest } from "../../shared/types.ts";

const SUBJECTS = ["Question about a product", "Help with an order", "Returns & exchanges", "Wholesale or bulk order", "Something else"];
const EMPTY: ContactRequest = { name: "", email: "", phone: "", subject: SUBJECTS[0], message: "", website: "" };

export function ContactPage() {
  const site = useSite();
  const [form, setForm] = useState<ContactRequest>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [formError, setFormError] = useState("");
  const crumbs = [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }];
  const set = (k: keyof ContactRequest) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("busy");
    setErrors({});
    setFormError("");
    try {
      await api("/api/contact", { method: "POST", json: form });
      setState("sent");
      setForm(EMPTY);
    } catch (err) {
      setErrors((err as ApiRequestError).fields ?? {});
      setFormError((err as Error).message);
      setState("idle");
    }
  };

  return (
    <>
      <Seo
        title="Contact Us"
        description="Questions about a product, your order or a return? Send Bokul Cloth Store a message — we reply within one working day."
        path="/contact"
        jsonLd={[storeLd(site), breadcrumbLd(site, crumbs)]}
      />
      <PageHero eyebrow="We're here to help" title="Contact Us" crumbs={crumbs} intro="Questions about sizing, an order or a return? Send us a message and we'll reply within one working day." />
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2 className="display contact-info__title">Get in touch</h2>
            <ul className="contact-list">
              {site.email && (
                <li>
                  <span className="promise__icon"><Icon name="mail" /></span>
                  <span><strong>Email</strong><a href={`mailto:${site.email}`}>{site.email}</a></span>
                </li>
              )}
              {site.phone && (
                <li>
                  <span className="promise__icon"><Icon name="phone" /></span>
                  <span><strong>Call us</strong><a href={telHref(site.phone)}>{site.phone}</a></span>
                </li>
              )}
              {site.address && (
                <li>
                  <span className="promise__icon"><Icon name="pin" /></span>
                  <span>
                    <strong>Visit our shop</strong>
                    {site.address}
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                      Get directions on Google Maps<span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </span>
                </li>
              )}
              <li>
                <span className="promise__icon"><Icon name="clock" /></span>
                <span><strong>Replies</strong>Within one working day</span>
              </li>
              <li>
                <span className="promise__icon"><Icon name="truck" /></span>
                <span><strong>Delivery</strong>Across {STORE.country}, cash on delivery</span>
              </li>
            </ul>
            <p className="contact-info__note">
              The quickest way to reach us is a phone call. Writing about an order? Include your order number (it starts with “BK”). Many answers are already in our <Link to="/faq">FAQ</Link>.
            </p>
          </div>

          <div className="form-card">
            {state === "sent" ? (
              <div className="sent" role="status">
                <span className="promise__icon"><Icon name="check" /></span>
                <h2 className="display">Message sent</h2>
                <p>Thank you — we've emailed you a copy and will reply within one working day.</p>
                <button type="button" className="btn btn--outline" onClick={() => setState("idle")}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="display form-card__title">Send a message</h2>
                {formError && <p className="notice notice--error" role="alert">{formError}</p>}
                <div className="form-grid">
                  <Field label="Your name" autoComplete="name" required value={form.name} onChange={set("name")} error={errors.name} />
                  <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} error={errors.email} />
                  <Field label="Mobile (optional)" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
                  <div className="field">
                    <label htmlFor="c-subject">Topic</label>
                    <select id="c-subject" value={form.subject} onChange={set("subject")}>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <TextArea className="span-2" label="Message" required rows={6} value={form.message} onChange={set("message")} error={errors.message} />
                </div>
                <div className="hp" aria-hidden="true">
                  <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
                </div>
                <button type="submit" className="btn btn--gold" disabled={state === "busy"}>
                  {state === "busy" ? "Sending…" : "Send message"}
                </button>
                <p className="summary__fine">We use your details only to answer you. See our <Link to="/privacy">privacy policy</Link>.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
