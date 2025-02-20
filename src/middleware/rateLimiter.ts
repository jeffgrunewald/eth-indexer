/* eslint-disable @typescript-eslint/no-explicit-any */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const REFILL_RATE = 1;
const MAX_TOKENS = 10;
const COST_PER_REQUEST = 1;

// In-memory store of IP -> TokenBucketn for simplicity
const buckets = new Map<string, TokenBucket>();

export function rateLimiter(req: any, res: any, next: () => void) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  //  Get requestor bucket or initialize if a new user
  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // Refill tokens based on time elapsed
  const timePassed = (now - bucket.lastRefill) / 1000; // convert to seconds
  const tokensToAdd = Math.floor(timePassed * REFILL_RATE);
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, MAX_TOKENS);
    bucket.lastRefill = now;
  }

  // Check if enough tokens and consume
  if (bucket.tokens >= COST_PER_REQUEST) {
    bucket.tokens -= COST_PER_REQUEST;
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_TOKENS);
    res.setHeader('X-RateLimit-Remaining', bucket.tokens);
    res.setHeader('X-RateLimit-Reset', Math.ceil((MAX_TOKENS - bucket.tokens) / REFILL_RATE));
    
    next();
  } else {
    // Calculate time until next token
    const waitTime = Math.ceil((COST_PER_REQUEST - bucket.tokens) / REFILL_RATE);
    
    res.setHeader('X-RateLimit-Limit', MAX_TOKENS);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', waitTime);
    res.status(429).json({ 
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${waitTime} seconds`
    });
  }
} 