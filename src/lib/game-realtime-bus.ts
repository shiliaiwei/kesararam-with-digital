import PusherServer from "pusher";
import type { SSEEvent } from "./game-event-bus";

// Lazily initialized Pusher instance to prevent boot issues when keys are missing
let pusherInstance: PusherServer | null = null;

function getPusher(): PusherServer | null {
  if (pusherInstance) return pusherInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  if (!appId || !key || !secret) {
    console.warn("Pusher server keys are missing in environment variables. Realtime broadcasts will fail in Pusher mode.");
    return null;
  }

  pusherInstance = new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherInstance;
}

export async function broadcastRealtime(code: string, event: SSEEvent): Promise<boolean> {
  const pusher = getPusher();
  if (!pusher) return false;

  const channelName = `game-${code.toUpperCase()}`;
  try {
    await pusher.trigger(channelName, "game-event", event);
    return true;
  } catch (error) {
    console.error(`Pusher broadcast failure for session ${code}:`, error);
    return false;
  }
}
