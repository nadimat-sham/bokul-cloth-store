// Subscribes to a Server-Sent Events stream and reports connection state.
// EventSource reconnects by itself after network drops or server restarts.
import { useEffect, useRef, useState } from "react";
import type { LiveEvent } from "../../shared/types.ts";

export type LiveState = "connecting" | "live" | "offline";

const TYPES: LiveEvent["type"][] = ["order.created", "order.updated", "message.created", "message.updated", "subscriber.created", "product.updated"];

export function useLiveEvents(url: string | null, onEvent: (e: LiveEvent) => void): LiveState {
  const [state, setState] = useState<LiveState>("connecting");
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    if (!url || typeof EventSource === "undefined") return;
    const es = new EventSource(url);
    es.onopen = () => setState("live");
    es.onerror = () => setState(es.readyState === EventSource.CLOSED ? "offline" : "connecting");
    const listener = (msg: MessageEvent) => {
      try {
        handler.current(JSON.parse(msg.data) as LiveEvent);
      } catch {
        /* ignore malformed event */
      }
    };
    for (const t of TYPES) es.addEventListener(t, listener);
    return () => es.close();
  }, [url]);

  return state;
}
