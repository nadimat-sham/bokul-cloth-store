// Store admin: orders, products & stock, messages. Client-only (never indexed).
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { api, ApiRequestError } from "../../lib/api.ts";
import { Logo } from "../../components/Logo.tsx";
import { Icon } from "../../components/Icon.tsx";
import { Field, TextArea } from "../../components/Field.tsx";
import { SHIPPING, STATUS_LABEL, formatMoney } from "../../../shared/store.ts";
import type { Category, LiveEvent, Order, OrderStatus, Product } from "../../../shared/types.ts";
import { useLiveEvents } from "../../lib/live.ts";
import { chime, desktopNotify, notifyPermission, requestNotifyPermission, setSoundEnabled, soundEnabled, type NotifyPermission } from "./alerts.ts";

interface Stats { orders: number; pending: number; open: number; revenue: number; unreadMessages: number; subscribers: number; lowStock: number }
interface Message { id: number; name: string; email: string; phone: string | null; subject: string; message: string; handled: boolean; created_at: string }

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const fmtDate = (s: string) => new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminApp() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    api<{ signedIn: boolean }>("/api/admin/session").then((r) => setSignedIn(r.signedIn), () => setSignedIn(false));
  }, []);
  if (signedIn === null) return <p className="admin-loading">Loading…</p>;
  return signedIn ? <Dashboard onSignOut={() => setSignedIn(false)} /> : <Login onDone={() => setSignedIn(true)} />;
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/login", { method: "POST", json: { password } });
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };
  return (
    <main className="admin-login">
      <form onSubmit={submit} className="form-card">
        <Logo variant="dark" />
        <h1 className="display">Store admin</h1>
        <Field label="Admin password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={error} autoFocus />
        <button className="btn btn--gold btn--block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <Link to="/" className="link-arrow"><Icon name="arrowLeft" size={16} /> Back to the shop</Link>
      </form>
    </main>
  );
}

type Tab = "orders" | "products" | "messages";

interface Toast {
  id: number;
  title: string;
  body: string;
  tab?: Tab;
}

const BASE_TITLE = "Store admin | Bokul Cloth Store";

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("orders");
  const [stats, setStats] = useState<Stats | null>(null);
  const [refresh, setRefresh] = useState<Record<Tab, number>>({ orders: 0, products: 0, messages: 0 });
  const [freshOrders, setFreshOrders] = useState<Set<string>>(() => new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [perm, setPerm] = useState<NotifyPermission>("default");
  const [sound, setSound] = useState(true);
  const refreshStats = useCallback(() => void api<Stats>("/api/admin/stats").then(setStats, () => undefined), []);
  useEffect(refreshStats, [refreshStats]);
  useEffect(() => {
    setPerm(notifyPermission());
    setSound(soundEnabled());
  }, []);

  // Unseen-alert counter in the browser tab title while the tab is in the background
  useEffect(() => {
    document.title = unseen ? `(${unseen}) ${BASE_TITLE}` : BASE_TITLE;
  }, [unseen]);
  useEffect(() => {
    const onVisible = () => !document.hidden && setUnseen(0);
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const bump = (...tabs: Tab[]) => setRefresh((r) => ({ ...r, ...Object.fromEntries(tabs.map((t) => [t, r[t] + 1])) }));
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const alert = (toast: Omit<Toast, "id">, tag: string, loud = true) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { ...toast, id }]);
    setTimeout(() => dismiss(id), 9000);
    if (!loud) return;
    chime();
    desktopNotify(toast.title, toast.body, tag, () => toast.tab && setTab(toast.tab));
    if (document.hidden) setUnseen((n) => n + 1);
  };

  const live = useLiveEvents("/api/admin/events", (e: LiveEvent) => {
    refreshStats();
    switch (e.type) {
      case "order.created":
        bump("orders", "products");
        setFreshOrders((s) => new Set(s).add(e.orderNumber));
        alert({ title: `New order ${e.orderNumber}`, body: `${e.customerName} · ${e.itemCount} item${e.itemCount === 1 ? "" : "s"} · ${formatMoney(e.total)}`, tab: "orders" }, e.orderNumber);
        break;
      case "order.updated":
        bump("orders");
        break;
      case "message.created":
        bump("messages");
        alert({ title: "New message", body: `${e.name}: ${e.subject}`, tab: "messages" }, `msg-${e.id}`);
        break;
      case "message.updated":
        bump("messages");
        break;
      case "product.updated":
        bump("products");
        break;
      case "subscriber.created":
        alert({ title: "New newsletter subscriber", body: "Someone joined the mailing list." }, "sub", false);
        break;
    }
  });

  const enableAlerts = async () => {
    setPerm(await requestNotifyPermission());
    chime(); // also unlocks audio after this click
  };
  const toggleSound = () => {
    setSoundEnabled(!sound);
    setSound(!sound);
  };
  const signOut = async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    onSignOut();
  };
  return (
    <div className="admin-app">
      <header className="admin-bar">
        <Logo />
        <nav aria-label="Admin sections" className="admin-tabs">
          {(["orders", "products", "messages"] as Tab[]).map((t) => (
            <button key={t} type="button" className={tab === t ? "is-active" : ""} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
              {t === "orders" && stats?.pending ? <span className="bag-count">{stats.pending}</span> : null}
              {t === "messages" && stats?.unreadMessages ? <span className="bag-count">{stats.unreadMessages}</span> : null}
            </button>
          ))}
        </nav>
        <div className="admin-bar__end">
          <span className={`live-dot live-dot--${live}`} role="status">
            {live === "live" ? "Live" : live === "connecting" ? "Connecting…" : "Offline — refresh"}
          </span>
          {perm === "default" && (
            <button type="button" className="link-btn" onClick={enableAlerts}>
              <Icon name="bell" size={16} /> Enable desktop alerts
            </button>
          )}
          {perm === "denied" && <span className="admin-bar__hint" title="Allow notifications for this site in your browser settings">Desktop alerts blocked</span>}
          <button type="button" className="link-btn" onClick={toggleSound} aria-pressed={sound}>
            <Icon name={sound ? "sound" : "mute"} size={16} /> Sound {sound ? "on" : "off"}
          </button>
          <Link to="/" target="_blank" rel="noopener">View shop</Link>
          <button type="button" className="link-btn" onClick={signOut}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </header>
      <main className="admin-main">
        {stats && (
          <dl className="admin-stats">
            <div><dt>Orders</dt><dd>{stats.orders}</dd></div>
            <div><dt>Awaiting confirmation</dt><dd>{stats.pending}</dd></div>
            <div><dt>Confirmed / shipped</dt><dd>{stats.open}</dd></div>
            <div><dt>Sales (excl. cancelled)</dt><dd>{formatMoney(stats.revenue)}</dd></div>
            <div><dt>Low-stock sizes (≤2)</dt><dd>{stats.lowStock}</dd></div>
            <div><dt>Subscribers</dt><dd>{stats.subscribers}</dd></div>
          </dl>
        )}
        {tab === "orders" && <Orders onChange={refreshStats} refreshKey={refresh.orders} fresh={freshOrders} />}
        {tab === "products" && <Products onChange={refreshStats} refreshKey={refresh.products} />}
        {tab === "messages" && <Messages onChange={refreshStats} refreshKey={refresh.messages} />}
      </main>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span className="toast__icon"><Icon name="bell" size={18} /></span>
            <div className="toast__body">
              <strong>{t.title}</strong>
              <span>{t.body}</span>
              {t.tab && t.tab !== tab && (
                <button type="button" className="link-btn" onClick={() => { setTab(t.tab!); dismiss(t.id); }}>Open {t.tab}</button>
              )}
            </div>
            <button type="button" className="icon-btn toast__close" aria-label="Dismiss" onClick={() => dismiss(t.id)}><Icon name="close" size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Orders({ onChange, refreshKey, fresh }: { onChange: () => void; refreshKey: number; fresh: Set<string> }) {
  const [filter, setFilter] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    api<Order[]>(`/api/admin/orders${filter ? `?status=${filter}` : ""}`).then(setOrders, (e) => setError(e.message));
  }, [filter]);
  useEffect(load, [load, refreshKey]);

  const update = async (o: Order, status: OrderStatus) => {
    if (status === "cancelled" && !confirm(`Cancel order ${o.orderNumber}? Its items go back into stock and the customer is emailed.`)) return;
    try {
      const updated = await api<Order>(`/api/admin/orders/${o.orderNumber}`, { method: "PATCH", json: { status } });
      setOrders((list) => list?.map((x) => (x.orderNumber === o.orderNumber ? updated : x)) ?? null);
      onChange();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <section aria-labelledby="orders-h">
      <div className="admin-head">
        <h1 id="orders-h" className="display">Orders</h1>
        <label className="select-label"><span>Status</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="notice notice--error">{error}</p>}
      {!orders ? <p>Loading…</p> : !orders.length ? <p className="notice">No orders yet.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Order</th><th scope="col">Placed</th><th scope="col">Customer</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Details</span></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <OrderRow key={o.orderNumber} o={o} isNew={fresh.has(o.orderNumber)} open={open === o.orderNumber} toggle={() => setOpen(open === o.orderNumber ? null : o.orderNumber)} update={update} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function OrderRow({ o, isNew, open, toggle, update }: { o: Order; isNew: boolean; open: boolean; toggle: () => void; update: (o: Order, s: OrderStatus) => void }) {
  return (
    <>
      <tr className={isNew ? "is-new" : undefined}>
        <th scope="row">{o.orderNumber}{isNew && <span className="new-badge">New</span>}</th>
        <td>{fmtDate(o.createdAt)}</td>
        <td>{o.customerName}<br /><a href={`tel:${o.phone}`}>{o.phone}</a></td>
        <td>{formatMoney(o.total)}</td>
        <td>
          <label className="visually-hidden" htmlFor={`st-${o.orderNumber}`}>Status of {o.orderNumber}</label>
          <select id={`st-${o.orderNumber}`} className={`status status--${o.status}`} value={o.status} onChange={(e) => update(o, e.target.value as OrderStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </td>
        <td><button type="button" className="link-btn" aria-expanded={open} onClick={toggle}>{open ? "Hide" : "Details"}</button></td>
      </tr>
      {open && (
        <tr className="admin-detail">
          <td colSpan={6}>
            <div className="admin-detail__grid">
              <div>
                <h3>Items</h3>
                <ul>{o.items.map((i) => <li key={i.productSlug + i.size}>{i.quantity} × {i.productName} (size {i.size}) — {formatMoney(i.lineTotal)}</li>)}</ul>
                <p>Subtotal {formatMoney(o.subtotal)} · Delivery {o.shippingFee ? formatMoney(o.shippingFee) : "free"} · <strong>Total {formatMoney(o.total)}</strong></p>
              </div>
              <div>
                <h3>Deliver to</h3>
                <p>{o.customerName}<br />{o.address}<br />{o.city} ({SHIPPING[o.deliveryZone].label})<br /><a href={`mailto:${o.email}`}>{o.email}</a></p>
                {o.notes && <p><strong>Note:</strong> {o.notes}</p>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

type Draft = Omit<Product, "id" | "categorySlug" | "categoryName" | "image" | "updatedAt"> & { id?: number; categoryId: number };

function toDraft(p: Product | null, cats: Category[]): Draft {
  return {
    id: p?.id,
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    categoryId: cats.find((c) => c.slug === p?.categorySlug)?.id ?? cats[0]?.id ?? 0,
    summary: p?.summary ?? "",
    description: p?.description ?? "",
    fabric: p?.fabric ?? "",
    care: p?.care ?? "",
    color: p?.color ?? "",
    price: p?.price ?? 0,
    compareAtPrice: p?.compareAtPrice ?? null,
    featured: p?.featured ?? false,
    active: p?.active ?? true,
    sizes: p?.sizes.map((s) => ({ ...s })) ?? [{ size: "M", stock: 0 }],
  };
}

function Products({ onChange, refreshKey }: { onChange: () => void; refreshKey: number }) {
  const [data, setData] = useState<{ products: Product[]; categories: Category[] } | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const load = useCallback(() => void api<{ products: Product[]; categories: Category[] }>("/api/admin/products").then(setData), []);
  useEffect(load, [load, refreshKey]);
  if (!data) return <p>Loading…</p>;
  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        categories={data.categories}
        onClose={() => setEditing(null)}
        onSaved={() => { load(); onChange(); }}
      />
    );
  }
  return (
    <section aria-labelledby="products-h">
      <div className="admin-head">
        <h1 id="products-h" className="display">Products</h1>
        <button type="button" className="btn btn--gold btn--sm" onClick={() => setEditing("new")}><Icon name="plus" size={16} /> Add product</button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">Stock by size</th><th scope="col">Shown</th><th scope="col"><span className="visually-hidden">Edit</span></th></tr></thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="admin-product"><img src={p.image} alt="" width={40} height={50} />{p.name}</th>
                <td>{p.categoryName}</td>
                <td>{formatMoney(p.price)}</td>
                <td>{p.sizes.map((s) => <span key={s.size} className={`stock-chip ${s.stock <= 2 ? "is-low" : ""}`}>{s.size}: {s.stock}</span>)}</td>
                <td>{p.active ? "Yes" : "Hidden"}{p.featured ? " · ★" : ""}</td>
                <td><button type="button" className="link-btn" onClick={() => setEditing(p)}>Edit<span className="visually-hidden"> {p.name}</span></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(() => toDraft(product, categories));
  const [image, setImage] = useState(product?.image ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMsg("");
    try {
      const saved = await api<Product>(d.id ? `/api/admin/products/${d.id}` : "/api/admin/products", { method: d.id ? "PUT" : "POST", json: d });
      setD(toDraft(saved, categories));
      setImage(saved.image);
      setMsg("Saved.");
      onSaved();
    } catch (err) {
      setErrors((err as ApiRequestError).fields ?? {});
      setMsg((err as Error).message);
    }
    setBusy(false);
  };

  const upload = async (file: File | undefined) => {
    if (!file || !d.id) return;
    setMsg("Uploading…");
    try {
      const saved = await api<Product>(`/api/admin/products/${d.id}/image`, { method: "POST", body: file, headers: { "Content-Type": file.type } });
      setImage(saved.image);
      setMsg("Photo updated.");
      onSaved();
    } catch (err) {
      setMsg((err as Error).message);
    }
  };

  return (
    <section aria-labelledby="pf-h">
      <div className="admin-head">
        <h1 id="pf-h" className="display">{d.id ? `Edit: ${product?.name}` : "New product"}</h1>
        <button type="button" className="link-btn" onClick={onClose}><Icon name="arrowLeft" size={16} /> All products</button>
      </div>
      <form className="form-card admin-form" onSubmit={save} noValidate>
        <div className="form-grid">
          <Field label="Name" required value={d.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
          <Field label="URL slug" value={d.slug} onChange={(e) => set("slug", e.target.value)} error={errors.slug} hint="Leave blank to generate from the name. Changing it changes the product's web address." />
          <div className="field">
            <label htmlFor="pf-cat">Category</label>
            <select id="pf-cat" value={d.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Colour" value={d.color} onChange={(e) => set("color", e.target.value)} />
          <Field label="Price (৳)" type="number" min={1} required value={d.price || ""} onChange={(e) => set("price", Number(e.target.value))} error={errors.price} />
          <Field label="Was price (৳, optional)" type="number" min={0} value={d.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)} error={errors.compareAtPrice} />
          <Field label="Fabric" value={d.fabric} onChange={(e) => set("fabric", e.target.value)} />
          <Field label="Care" value={d.care} onChange={(e) => set("care", e.target.value)} />
          <Field className="span-2" label="Short summary" required value={d.summary} onChange={(e) => set("summary", e.target.value)} error={errors.summary} />
          <TextArea className="span-2" label="Description" required rows={5} value={d.description} onChange={(e) => set("description", e.target.value)} error={errors.description} />
        </div>
        <fieldset className="admin-sizes">
          <legend className="form-legend">Sizes & stock</legend>
          {errors.sizes && <p className="field__error">{errors.sizes}</p>}
          {d.sizes.map((s, i) => (
            <div key={i} className="admin-size-row">
              <Field label="Size" value={s.size} onChange={(e) => set("sizes", d.sizes.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))} />
              <Field label="Stock" type="number" min={0} value={s.stock} onChange={(e) => set("sizes", d.sizes.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))} />
              <button type="button" className="icon-btn" aria-label={`Remove size ${s.size}`} onClick={() => set("sizes", d.sizes.filter((_, j) => j !== i))}><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <button type="button" className="link-btn" onClick={() => set("sizes", [...d.sizes, { size: "", stock: 0 }])}><Icon name="plus" size={16} /> Add size</button>
        </fieldset>
        <div className="admin-checks">
          <label><input type="checkbox" checked={d.active} onChange={(e) => set("active", e.target.checked)} /> Show in shop</label>
          <label><input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} /> Feature on homepage</label>
        </div>
        <div className="admin-photo">
          {image && <img src={image} alt="" width={120} height={150} />}
          <div>
            <p className="form-legend">Photo</p>
            {d.id ? (
              <label className="btn btn--outline btn--sm">
                <Icon name="upload" size={16} /> Upload photo (JPEG/PNG/WebP, 4:5 portrait)
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="visually-hidden" onChange={(e) => upload(e.target.files?.[0])} />
              </label>
            ) : (
              <p className="field__hint">Save the product first, then upload its photo.</p>
            )}
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn--gold" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
          {d.id && <a className="btn btn--outline" href={`/product/${d.slug}`} target="_blank" rel="noopener">View in shop</a>}
        </div>
        <p role="status" className="admin-msg">{msg}</p>
      </form>
    </section>
  );
}

function Messages({ onChange, refreshKey }: { onChange: () => void; refreshKey: number }) {
  const [list, setList] = useState<Message[] | null>(null);
  const load = useCallback(() => void api<Message[]>("/api/admin/messages").then(setList), []);
  useEffect(load, [load, refreshKey]);
  const toggle = async (m: Message) => {
    await api(`/api/admin/messages/${m.id}`, { method: "PATCH", json: { handled: !m.handled } });
    load();
    onChange();
  };
  return (
    <section aria-labelledby="msg-h">
      <div className="admin-head"><h1 id="msg-h" className="display">Messages</h1></div>
      {!list ? <p>Loading…</p> : !list.length ? <p className="notice">No messages yet.</p> : (
        <ul className="admin-messages">
          {list.map((m) => (
            <li key={m.id} className={m.handled ? "is-handled" : ""}>
              <div className="admin-messages__head">
                <strong>{m.subject}</strong>
                <span>{fmtDate(m.created_at)}</span>
              </div>
              <p className="admin-messages__from">{m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}>{m.email}</a>{m.phone ? <> · <a href={`tel:${m.phone}`}>{m.phone}</a></> : null}</p>
              <p className="admin-messages__body">{m.message}</p>
              <button type="button" className="link-btn" onClick={() => toggle(m)}>{m.handled ? "Mark as unread" : "Mark as handled"}</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
