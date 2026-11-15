import { Link } from "react-router";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  return (
    <nav aria-label="Breadcrumb" className={`breadcrumbs breadcrumbs--${tone}`}>
      <ol>
        {items.map((c, i) => (
          <li key={c.path}>
            {i < items.length - 1 ? <Link to={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
