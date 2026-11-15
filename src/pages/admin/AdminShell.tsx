import { useEffect, useState, type ReactNode } from "react";
import { Seo } from "../../lib/seo.tsx";

/** The admin panel is client-only: the server sends just this shell (noindex),
 *  and the lazily-loaded admin app mounts in the browser. */
export function AdminShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <Seo title="Store admin" description="Bokul Cloth Store administration." path="/admin" noindex />
      <div className="admin">{mounted ? children : <p className="admin-loading">Loading admin…</p>}</div>
    </>
  );
}
