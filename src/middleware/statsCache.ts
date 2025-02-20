import { TransferStats } from '../types';

interface CachedStats {
  data: TransferStats;
  timestamp: number;
}

const CACHE_TTL = 5000; // 5 seconds in milliseconds
let statsCache: CachedStats | null = null;

export function withStatsCache(handler: () => Promise<TransferStats>): Promise<TransferStats> {
  const now = Date.now();

  // Return cached data if valid
  if (statsCache && (now - statsCache.timestamp) < CACHE_TTL) {
    return Promise.resolve({
      ...statsCache.data,
      refreshedAt: new Date(statsCache.timestamp)
    });
  }

  // Otherwise fetch fresh data
  return handler().then(data => {
    statsCache = {
      data,
      timestamp: now
    };
    return {
      ...data,
      refreshedAt: new Date(now)
    };
  });
} 