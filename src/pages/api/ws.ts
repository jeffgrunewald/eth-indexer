import { Server } from 'ws';
import { transferEmitter } from '../../services/eventEmitter';
import { TransferEvent } from '../../types';
import { createServer } from 'http';

interface WSSubscription {
  wallets?: string[];
}

export function setupWebSocketServer(server: ReturnType<typeof createServer>) {
  const wss = new Server({ server });

  wss.on('connection', (ws) => {
    const subscription: WSSubscription = {};

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.wallets) {
          subscription.wallets = data.wallets.map((w: string) => w.toLowerCase());
        }
      } catch (error) {
        console.error('Error parsing subscription:', error);
      }
    });

    const handleTransfer = (event: TransferEvent) => {
      if (!subscription.wallets?.length || 
          subscription.wallets.some(wallet => 
            wallet === event.from.toLowerCase() || 
            wallet === event.to.toLowerCase()
          )) {
        const jsonEvent = {
          ...event,
          value: event.value.toString()
        };
        ws.send(JSON.stringify(jsonEvent));
      }
    };

    transferEmitter.on('transfer', handleTransfer);

    ws.on('close', () => {
      transferEmitter.off('transfer', handleTransfer);
    });
  });

  return wss;
} 