// Admin alerts: a short chime (generated, no audio file) and desktop notifications.
const SOUND_KEY = "bokul-admin-sound";

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable */
  }
}

let ctx: AudioContext | null = null;

/** Two-note chime. Browsers only allow audio after the page has been clicked once. */
export function chime(): void {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.16;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {
    /* audio unavailable */
  }
}

export type NotifyPermission = NotificationPermission | "unsupported";

export function notifyPermission(): NotifyPermission {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export async function requestNotifyPermission(): Promise<NotifyPermission> {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.requestPermission();
}

/** Desktop notification; clicking it focuses the admin tab and runs `onClick`. */
export function desktopNotify(title: string, body: string, tag: string, onClick?: () => void): void {
  if (notifyPermission() !== "granted") return;
  try {
    const n = new Notification(title, { body, tag, icon: "/icon-512.png", badge: "/icon-512.png" });
    n.onclick = () => {
      window.focus();
      onClick?.();
      n.close();
    };
  } catch {
    /* some mobile browsers only allow notifications from a service worker */
  }
}
