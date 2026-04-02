import type { WebSocket } from 'ws';

/** Map: userId → Set of active WebSocket connections for that user */
const rooms = new Map<string, Set<WebSocket>>();

export function joinRoom(userId: string, ws: WebSocket): void {
  if (!rooms.has(userId)) {
    rooms.set(userId, new Set());
  }
  rooms.get(userId)!.add(ws);
}

export function leaveRoom(userId: string, ws: WebSocket): void {
  const room = rooms.get(userId);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) {
    rooms.delete(userId);
  }
}

export function broadcast(userId: string, event: string, payload: unknown): void {
  const room = rooms.get(userId);
  if (!room) return;

  const message = JSON.stringify({ type: event, payload });

  for (const client of room) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

export function getActiveSessionId(userId: string): string | null {
  return null; // stored on connection state, not globally
}
