// In-process event bus + Server-Sent Events streams. The admin dashboard and the
// customer's order page subscribe so they update live without refreshing.
import { EventEmitter } from "node:events";
import type { Request, Response } from "express";
import type { LiveEvent } from "../shared/types.ts";

const bus = new EventEmitter();
bus.setMaxListeners(0);

export function publish(event: LiveEvent): void {
  bus.emit("event", event);
}

/** Opens an SSE stream on `res`, forwarding events that pass `filter`. */
export function stream(req: Request, res: Response, filter: (e: LiveEvent) => boolean = () => true): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // tell nginx not to buffer
  });
  res.write("retry: 4000\n\n");
  const send = (e: LiveEvent) => {
    if (filter(e)) res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
  };
  // Comment line every 25 s keeps proxies from closing an idle connection
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25_000);
  bus.on("event", send);
  req.on("close", () => {
    clearInterval(heartbeat);
    bus.off("event", send);
  });
}
