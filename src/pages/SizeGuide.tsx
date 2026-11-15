import { Link } from "react-router";
import { Seo, breadcrumbLd } from "../lib/seo.tsx";
import { useSite } from "../lib/site.tsx";
import { PageHero } from "../components/PageHero.tsx";

interface Chart {
  id: string;
  title: string;
  note: string;
  head: string[];
  rows: string[][];
}

const CHARTS: Chart[] = [
  {
    id: "women",
    title: "Women — kameez, kurtis & tunics",
    note: "Body measurements in inches. Sarees are free size and come with an unstitched blouse piece.",
    head: ["Size", "Bust", "Waist", "Hip", "Garment length"],
    rows: [["S", "34", "28", "37", "40"], ["M", "36", "30", "39", "41"], ["L", "38", "32", "41", "42"], ["XL", "40", "34", "43", "43"]],
  },
  {
    id: "men",
    title: "Men — panjabis, shirts & polos",
    note: "Body measurements in inches. Panjabi length is measured from the shoulder.",
    head: ["Size", "Chest", "Shoulder", "Shirt length", "Panjabi length"],
    rows: [["S", "36", "16.5", "28", "40"], ["M", "38", "17", "29", "41"], ["L", "40", "18", "30", "42"], ["XL", "42", "18.5", "31", "43"], ["XXL", "44", "19.5", "32", "44"]],
  },
  {
    id: "trousers",
    title: "Men — chino trousers",
    note: "Sizes are the waist in inches. All chinos have a 31-inch inside leg.",
    head: ["Size", "Waist", "Hip", "Inside leg"],
    rows: [["30", "30", "38", "31"], ["32", "32", "40", "31"], ["34", "34", "42", "31"], ["36", "36", "44", "31"]],
  },
  {
    id: "kids",
    title: "Kids",
    note: "Sizes follow age; choose by height if your child is tall or petite for their age.",
    head: ["Size", "Height", "Chest", "Garment length"],
    rows: [["2-3Y", "36–39", "21", "18"], ["4-5Y", "40–44", "23", "21"], ["6-7Y", "45–49", "25", "24"], ["8-9Y", "50–53", "27", "27"]],
  },
];

export function SizeGuidePage() {
  const site = useSite();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Size guide", path: "/size-guide" }];
  return (
    <>
      <Seo title="Size Guide" description="Bokul Cloth Store size charts in inches for women's kurtis and three-pieces, men's panjabis, shirts and chinos, and kids' clothing." path="/size-guide" jsonLd={[breadcrumbLd(site, crumbs)]} />
      <PageHero eyebrow="Find your fit" title="Size Guide" crumbs={crumbs} intro="Measure a garment that fits you well, lay it flat and compare with the charts below." />
      <section className="section">
        <div className="container container--narrow prose">
          <nav aria-label="Size charts" className="pill-nav">
            {CHARTS.map((c) => <a key={c.id} href={`#${c.id}`}>{c.title.split(" — ")[0]}{c.id === "trousers" ? " trousers" : ""}</a>)}
          </nav>
          {CHARTS.map((c) => (
            <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`}>
              <h2 id={`${c.id}-h`}>{c.title}</h2>
              <p>{c.note}</p>
              <div className="table-wrap">
                <table>
                  <thead><tr>{c.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>
                    {c.rows.map((r) => (
                      <tr key={r[0]}>{r.map((v, i) => (i === 0 ? <th key={i} scope="row">{v}</th> : <td key={i}>{v}</td>))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          <h2>Between two sizes?</h2>
          <p>Choose the larger size for a relaxed fit, or <Link to="/contact">message us</Link> with your measurements and we'll recommend one. Wrong size? Exchanges are easy — see <Link to="/delivery-returns">delivery & returns</Link>.</p>
        </div>
      </section>
    </>
  );
}
