import { Response } from 'express';

type SSEClient = { id: string; res: Response };
const clients: SSEClient[] = [];

export function registerSSEClient(id: string, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const client = { id, res };
  clients.push(client);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  res.on('close', () => {
    const idx = clients.findIndex(c => c.id === id);
    if (idx !== -1) clients.splice(idx, 1);
  });
}

export function broadcastSSEEvent(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  clients.forEach(c => {
    c.res.write(`data: ${data}\n\n`);
  });
}
