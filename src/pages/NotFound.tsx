import { Link } from "react-router";
import { Seo } from "../lib/seo.tsx";
import { BcsMark } from "../components/Logo.tsx";

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" description="The page you were looking for isn't here." path="/404" noindex status={404} />
      <section className="section notfound">
        <div className="container container--narrow">
          <BcsMark className="notfound__mark" />
          <p className="eyebrow">Error 404</p>
          <h1 className="display">This page has wandered off</h1>
          <p>The link may be old or the product may have sold out and been removed. Try the shop, or head back home.</p>
          <div className="btn-row btn-row--center">
            <Link to="/shop" className="btn btn--gold">Browse the shop</Link>
            <Link to="/" className="btn btn--outline">Go to the homepage</Link>
          </div>
        </div>
      </section>
    </>
  );
}
