import type { FaqItem } from "../content/faq.ts";

/** Native <details> accordion: works without JavaScript and every answer is in the HTML. */
export function FaqList({ items, openFirst = true }: { items: FaqItem[]; openFirst?: boolean }) {
  return (
    <div className="faq-list">
      {items.map((f, i) => (
        <details key={f.q} className="faq-item" open={openFirst && i === 0}>
          <summary>
            <h3 className="faq-item__q">{f.q}</h3>
            <span className="faq-item__icon" aria-hidden="true" />
          </summary>
          <div className="faq-item__a"><p>{f.a}</p></div>
        </details>
      ))}
    </div>
  );
}
