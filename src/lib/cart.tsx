// Shopping bag, kept in this browser's localStorage. Prices shown here are a
// snapshot; the server re-prices and re-checks stock when the order is placed.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_QTY_PER_LINE } from "../../shared/store.ts";

export interface BagLine {
  slug: string;
  size: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface CartApi {
  lines: BagLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: BagLine) => void;
  setQuantity: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
}

const KEY = "bokul-bag-v1";
const CartContext = createContext<CartApi | null>(null);

function read(): BagLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((l) => l && typeof l.slug === "string" && typeof l.size === "string" && l.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable (private mode) — the bag still works for this visit */
    }
  }, [lines, ready]);

  const add = useCallback((line: BagLine) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === line.slug && l.size === line.size);
      if (i < 0) return [...prev, { ...line, quantity: Math.min(MAX_QTY_PER_LINE, line.quantity) }];
      const next = [...prev];
      next[i] = { ...line, quantity: Math.min(MAX_QTY_PER_LINE, prev[i].quantity + line.quantity) };
      return next;
    });
  }, []);

  const setQuantity = useCallback((slug: string, size: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.slug === slug && l.size === size ? { ...l, quantity: Math.max(0, Math.min(MAX_QTY_PER_LINE, qty)) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback((slug: string, size: string) => setLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size))), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.price * l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
