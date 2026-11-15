import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { BengaliName, Logo } from "./Logo.tsx";
import { Icon } from "./Icon.tsx";
import { Ornament } from "./SectionHeading.tsx";
import { useCart } from "../lib/cart.tsx";
import { useSite, telHref } from "../lib/site.tsx";
import { api } from "../lib/api.ts";
import { MAPS_URL, PHONE, PHONE_HREF, STORE, FREE_SHIPPING_FROM, formatMoney } from "../../shared/store.ts";

const RAIL_LINKS = [
  { to: "/shop/women", label: "Women" },
  { to: "/shop/men", label: "Men" },
  { to: "/shop/kids", label: "Kids" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const MENU_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop all" },
  { to: "/shop/women", label: "Women" },
  { to: "/shop/men", label: "Men" },
  { to: "/shop/kids", label: "Kids" },
  { to: "/shop/accessories", label: "Accessories" },
  { to: "/about", label: "About us" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

function BagCount() {
  const { count, ready } = useCart();
  if (!ready || !count) return null;
  return (
    <span className="bag-count" aria-hidden="true">
      {count}
    </span>
  );
}

function bagLabel(count: number, ready: boolean) {
  return ready && count ? `Shopping bag, ${count} item${count === 1 ? "" : "s"}` : "Shopping bag";
}

export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { count, ready } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggleRef.current?.focus();
    };
  }, [menuOpen]);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleRef.current = e.currentTarget;
    setMenuOpen(true);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <aside className="rail" aria-label="Site">
        <Logo compact />
        <nav className="rail__nav" aria-label="Main">
          {RAIL_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="rail__link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="rail__actions">
          <Link to="/cart" className="rail__bag" aria-label={bagLabel(count, ready)}>
            <Icon name="bag" size={18} />
            <span className="rail__bag-text">Bag</span>
            <BagCount />
          </Link>
          <button type="button" className="rail__menu" onClick={openMenu} aria-expanded={menuOpen} aria-controls="site-menu" aria-label="Open menu">
            <Icon name="menu" size={18} />
          </button>
        </div>
      </aside>

      <header className="topbar">
        <Logo />
        <div className="topbar__actions">
          <Link to="/shop" className="topbar__shop">
            Shop
          </Link>
          <Link to="/cart" className="icon-btn" aria-label={bagLabel(count, ready)}>
            <Icon name="bag" />
            <BagCount />
          </Link>
          <button type="button" className="icon-btn" onClick={openMenu} aria-expanded={menuOpen} aria-controls="site-menu" aria-label="Open menu">
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <div id="site-menu" ref={menuRef} className={`menu ${menuOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!menuOpen}>
        <div className="menu__top">
          <Logo />
          <button type="button" className="icon-btn icon-btn--light" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Menu" className="menu__nav">
          {MENU_LINKS.map((l, i) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/" || l.to === "/shop"} className="menu__link" style={{ transitionDelay: `${60 + i * 35}ms` }}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="menu__foot">
          <Link to="/cart" className="btn btn--gold">
            View bag{ready && count ? ` (${count})` : ""}
          </Link>
          <a href={PHONE_HREF} className="btn btn--ghost-light">
            <Icon name="phone" size={16} /> {PHONE.display}
          </a>
          <p>Cash on delivery across Bangladesh · Free delivery from {formatMoney(FREE_SHIPPING_FROM)}</p>
        </div>
      </div>

      <div className="page">
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "ok" | "error"; msg?: string }>({ kind: "idle" });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const r = await api<{ alreadySubscribed: boolean }>("/api/newsletter", { method: "POST", json: { email } });
      setState({ kind: "ok", msg: r.alreadySubscribed ? "You're already subscribed — thank you!" : "Thanks! Check your inbox for a welcome email." });
      setEmail("");
    } catch (err) {
      setState({ kind: "error", msg: (err as Error).message });
    }
  };
  return (
    <form className="newsletter" onSubmit={submit} noValidate>
      <label htmlFor="newsletter-email" className="newsletter__label">
        New arrivals & festive offers by email
      </label>
      <div className="newsletter__row">
        <input id="newsletter-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn btn--gold btn--sm" disabled={state.kind === "busy"}>
          {state.kind === "busy" ? "…" : "Subscribe"}
        </button>
      </div>
      <p className={`newsletter__msg ${state.kind === "error" ? "is-error" : ""}`} role="status" aria-live="polite">
        {state.msg}
      </p>
    </form>
  );
}

function Footer() {
  const site = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <BengaliName className="footer__bn" label={STORE.bengaliName} />
          <p>{STORE.description}</p>
          <Newsletter />
        </div>
        <nav aria-labelledby="f-shop">
          <h2 id="f-shop" className="footer__title">Shop</h2>
          <ul>
            <li><Link to="/shop">All clothing</Link></li>
            <li><Link to="/shop/women">Women</Link></li>
            <li><Link to="/shop/men">Men</Link></li>
            <li><Link to="/shop/kids">Kids</Link></li>
            <li><Link to="/shop/accessories">Accessories</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="f-help">
          <h2 id="f-help" className="footer__title">Customer care</h2>
          <ul>
            <li><Link to="/delivery-returns">Delivery & returns</Link></li>
            <li><Link to="/size-guide">Size guide</Link></li>
            <li><Link to="/faq">Frequently asked</Link></li>
            <li><Link to="/about">About Bokul</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="footer__title">Get in touch</h2>
          <ul className="footer__contact">
            {site.email && (
              <li>
                <Icon name="mail" size={16} />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            )}
            {site.phone && (
              <li>
                <Icon name="phone" size={16} />
                <a href={telHref(site.phone)}>{site.phone}</a>
              </li>
            )}
            {site.address && (
              <li>
                <Icon name="pin" size={16} />
                <span>
                  {site.address}
                  <br />
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="footer__map">
                    Get directions<span className="visually-hidden"> (opens Google Maps)</span>
                  </a>
                </span>
              </li>
            )}
            <li>
              <Icon name="truck" size={16} />
              <span>Delivering across {STORE.country}</span>
            </li>
            <li>
              <Icon name="cash" size={16} />
              <span>Cash on delivery</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container">
        <Ornament />
        <div className="footer__bottom">
          <p>© {year} {STORE.name}. All rights reserved.</p>
          <ul>
            <li><Link to="/terms">Terms & conditions</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
