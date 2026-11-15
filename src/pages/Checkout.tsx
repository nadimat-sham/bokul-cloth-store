import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Seo } from "../lib/seo.tsx";
import { api, ApiRequestError } from "../lib/api.ts";
import { PageHero } from "../components/PageHero.tsx";
import { Field, TextArea } from "../components/Field.tsx";
import { Icon } from "../components/Icon.tsx";
import { useBagCheck } from "./Cart.tsx";
import { EXCHANGE_DAYS, PHONE, PHONE_HREF, SHIPPING, formatMoney, shippingFee } from "../../shared/store.ts";
import type { CheckoutRequest, CheckoutResponse, DeliveryZone } from "../../shared/types.ts";

type Form = Omit<CheckoutRequest, "items">;

export function CheckoutPage() {
  const { cart, lines, subtotal, hasProblem } = useBagCheck();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ customerName: "", email: "", phone: "", address: "", city: "", deliveryZone: "inside_dhaka", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const fee = shippingFee(form.deliveryZone, subtotal);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError("");
    try {
      const res = await api<CheckoutResponse>("/api/orders", {
        method: "POST",
        json: { ...form, items: cart.lines.map(({ slug, size, quantity }) => ({ slug, size, quantity })) },
      });
      cart.clear();
      navigate(`/order/${res.orderNumber}?token=${res.token}`, { state: { justPlaced: true } });
    } catch (err) {
      const ae = err as ApiRequestError;
      setErrors(ae.fields ?? {});
      setFormError(ae.message);
      setBusy(false);
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".checkout-error, [aria-invalid='true']")?.focus());
    }
  };

  return (
    <>
      <Seo title="Checkout" description="Enter your delivery details to place a cash-on-delivery order with Bokul Cloth Store." path="/checkout" noindex />
      <PageHero eyebrow="Cash on delivery" title="Checkout" crumbs={[{ name: "Home", path: "/" }, { name: "Bag", path: "/cart" }, { name: "Checkout", path: "/checkout" }]} />
      <section className="section section--tight">
        <div className="container">
          {!cart.ready ? (
            <p className="notice">Loading your bag…</p>
          ) : !lines.length ? (
            <div className="empty">
              <h2 className="display">Your bag is empty</h2>
              <p>Add a few pieces before checking out.</p>
              <Link to="/shop" className="btn btn--dark">Browse the shop</Link>
            </div>
          ) : (
            <form className="checkout-grid" onSubmit={submit} noValidate>
              <div className="checkout-form">
                {formError && (
                  <p className="notice notice--error checkout-error" tabIndex={-1} role="alert">{formError}</p>
                )}
                <fieldset>
                  <legend className="form-legend">Your details</legend>
                  <div className="form-grid">
                    <Field label="Full name" name="name" autoComplete="name" required value={form.customerName} onChange={set("customerName")} error={errors.customerName} />
                    <Field label="Mobile number" name="tel" type="tel" inputMode="tel" autoComplete="tel" required placeholder="01XXXXXXXXX" value={form.phone} onChange={set("phone")} error={errors.phone} hint="We call this number to confirm your order." />
                    <Field className="span-2" label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} error={errors.email} hint="Your order confirmation and updates are sent here." />
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="form-legend">Delivery address</legend>
                  <div className="form-grid">
                    <TextArea className="span-2" label="Address" name="street-address" autoComplete="street-address" required rows={3} placeholder="House, road, area" value={form.address} onChange={set("address")} error={errors.address} />
                    <Field label="City / district" name="city" autoComplete="address-level2" required value={form.city} onChange={set("city")} error={errors.city} />
                  </div>
                  <div className="zone-options" role="radiogroup" aria-label="Delivery area">
                    {(Object.keys(SHIPPING) as DeliveryZone[]).map((z) => (
                      <label key={z} className={`zone ${form.deliveryZone === z ? "is-checked" : ""}`}>
                        <input type="radio" name="zone" value={z} checked={form.deliveryZone === z} onChange={() => setForm((f) => ({ ...f, deliveryZone: z }))} />
                        <span className="zone__label">{SHIPPING[z].label}</span>
                        <span className="zone__meta">{shippingFee(z, subtotal) === 0 ? "Free" : formatMoney(SHIPPING[z].fee)} · {SHIPPING[z].days}</span>
                      </label>
                    ))}
                  </div>
                  <TextArea label="Order note (optional)" name="notes" rows={2} value={form.notes} onChange={set("notes")} placeholder="Landmark, preferred delivery time…" />
                </fieldset>
              </div>
              <aside className="summary" aria-labelledby="co-summary">
                <h2 id="co-summary" className="summary__title">Your order</h2>
                <ul className="mini-lines">
                  {lines.map((l) => (
                    <li key={`${l.slug}-${l.size}`}>
                      <img src={l.image} alt="" width={56} height={70} />
                      <span>
                        {l.name}
                        <small>Size {l.size} × {l.quantity}</small>
                        {l.problem && <small className="field__error">{l.problem}</small>}
                      </span>
                      <strong>{formatMoney(l.price * l.quantity)}</strong>
                    </li>
                  ))}
                </ul>
                <dl>
                  <div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>{fee ? formatMoney(fee) : "Free"}</dd></div>
                  <div className="summary__total"><dt>Total</dt><dd>{formatMoney(subtotal + fee)}</dd></div>
                </dl>
                <p className="summary__pay"><Icon name="cash" size={18} /> <span><strong>Cash on delivery.</strong> Pay the courier when your parcel arrives.</span></p>
                <button type="submit" className="btn btn--gold btn--block" disabled={busy || hasProblem}>
                  {busy ? "Placing your order…" : `Place order · ${formatMoney(subtotal + fee)}`}
                </button>
                {hasProblem && <p className="field__error">Some items changed — <Link to="/cart">review your bag</Link>.</p>}
                <p className="summary__fine">
                  Need help ordering? Call <a href={PHONE_HREF}>{PHONE.display}</a>.
                </p>
                <p className="summary__fine">
                  By placing your order you agree to our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>. Unworn items can be returned within {EXCHANGE_DAYS} days.
                </p>
              </aside>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
