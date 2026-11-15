import { useEffect } from "react";

/** Fades `.reveal` elements in as they scroll into view. Elements already on
 *  screen show immediately; nothing is hidden without JavaScript or when the
 *  visitor prefers reduced motion. */
export function useReveal(): void {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    const scan = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not([data-rv])").forEach((el) => {
        el.dataset.rv = "1";
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
        else io.observe(el);
      });
    };
    scan();
    document.documentElement.classList.add("reveal-ready");
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
