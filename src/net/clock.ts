/**
 * In a room the server stamps when a turn starts and ends, so every device counts down against
 * the server's clock. A phone's clock can be seconds off; the offset corrects for it.
 * Offline it stays 0 and this is just Date.now().
 */
let offset = 0;

export const serverNow = () => Date.now() + offset;

/** Called with the server's time on each message; the newest reading wins. */
export function syncClock(serverTime: number) {
  offset = serverTime - Date.now();
}

export function resetClock() {
  offset = 0;
}

export const clockOffset = () => offset;
