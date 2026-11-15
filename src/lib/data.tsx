// Data cache shared by server rendering and the browser. The server prefetches
// every API path a page needs (see routes.tsx → dataKeys) and embeds the
// results; the browser hydrates from them and fetches anything new on navigation.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface CacheEntry {
  status: number;
  body: unknown;
  at?: number;
}
type Cache = Map<string, CacheEntry>;

const DataContext = createContext<Cache>(new Map());

export function DataProvider({ initial, children }: { initial: Record<string, CacheEntry>; children: ReactNode }) {
  const [cache] = useState<Cache>(() => new Map(Object.entries(initial).map(([k, v]) => [k, { ...v, at: Date.now() }])));
  return <DataContext.Provider value={cache}>{children}</DataContext.Provider>;
}

const STALE_MS = 60_000;

export interface ApiState<T> {
  data: T | undefined;
  status: number | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApi<T>(key: string | null): ApiState<T> {
  const cache = useContext(DataContext);
  const cached = key ? cache.get(key) : undefined;
  const [, force] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (k: string) => {
      try {
        const res = await fetch(k, { headers: { Accept: "application/json" } });
        const body = await res.json();
        cache.set(k, { status: res.status, body, at: Date.now() });
        setError(null);
      } catch {
        setError("Couldn't load this — check your connection and try again.");
      }
      force((n) => n + 1);
    },
    [cache],
  );

  useEffect(() => {
    if (!key) return;
    const entry = cache.get(key);
    if (!entry || !entry.at || Date.now() - entry.at > STALE_MS) void load(key);
  }, [key, cache, load]);

  const ok = cached && cached.status < 400;
  return {
    data: ok ? (cached.body as T) : undefined,
    status: cached?.status,
    loading: !!key && !cached && !error,
    error,
    reload: () => key && void load(key),
  };
}
