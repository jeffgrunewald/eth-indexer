import { TransferEvent } from '../types';

export function createSampleEvents(count: number): TransferEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    from: `0x${(i + 1).toString().padStart(40, '0')}`,
    to: `0x${(i + 2).toString().padStart(40, '0')}`,
    value: BigInt((i + 1) * 10000000),
    transactionHash: `0x${(i + 1).toString().padStart(64, '0')}`,
    blockNumber: 1000000 + i,
    timestamp: Math.floor(Date.now() / 1000) - (i * 3600) // Each event 1 hour apart
  }));
} 