/**
 * Rate Limiter Middleware for Victor IA Website
 * TypeScript version for Next.js API routes
 * Memory-based with optional Redis support
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  createdAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number | null;
}

/**
 * Rate Limiter class
 */
export class RateLimiter {
  private max: number;
  private windowMs: number;
  private store: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timer;

  constructor(options: { max?: number; windowMs?: number } = {}) {
    this.max = options.max || 3;
    this.windowMs = options.windowMs || 600000; // 10 minutes
    this.store = new Map();

    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Check if request is rate limited
   */
  check(ip: string, endpoint: string = 'default'): RateLimitResult {
    const now = Date.now();
    const key = `${ip}:${endpoint}`;
    let entry = this.store.get(key);

    // Entry expired or doesn't exist
    if (!entry || entry.resetTime < now) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
        createdAt: now
      });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetTime: now + this.windowMs,
        retryAfter: null
      };
    }

    // Within rate limit window
    if (entry.count < this.max) {
      entry.count++;
      return {
        allowed: true,
        remaining: this.max - entry.count,
        resetTime: entry.resetTime,
        retryAfter: null
      };
    }

    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter
    };
  }

  /**
   * Reset a specific IP/endpoint
   */
  reset(ip: string, endpoint: string = 'default'): void {
    const key = `${ip}:${endpoint}`;
    this.store.delete(key);
  }

  /**
   * Reset all limits
   */
  resetAll(): void {
    this.store.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current status for debugging
   */
  status(ip: string, endpoint: string = 'default'): object {
    const key = `${ip}:${endpoint}`;
    const entry = this.store.get(key);
    if (!entry) {
      return { count: 0, resetTime: null, expired: true };
    }
    return {
      count: entry.count,
      resetTime: new Date(entry.resetTime).toISOString(),
      expired: entry.resetTime < Date.now()
    };
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Extract client IP from Next.js request
 */
export function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.headers['x-real-ip']
    ? req.headers['x-real-ip']
    : req.socket?.remoteAddress || 'unknown';

  return ip;
}

/**
 * Create a singleton rate limiter instance
 */
let globalLimiter: RateLimiter | null = null;

export function getGlobalLimiter(options?: { max?: number; windowMs?: number }): RateLimiter {
  if (!globalLimiter) {
    globalLimiter = new RateLimiter(options);
  }
  return globalLimiter;
}

/**
 * Next.js API route middleware factory
 * Usage:
 * ```
 * export const runtime = 'nodejs';
 * const limiter = createRateLimitMiddleware();
 * export async function POST(req) {
 *   const result = limiter.check(req);
 *   if (!result.allowed) {
 *     return result.response;
 *   }
 *   // Handle request
 * }
 * ```
 */
export function createRateLimitMiddleware(options?: {
  max?: number;
  windowMs?: number;
}) {
  const limiter = new RateLimiter(options);

  return {
    check(req: any): {
      allowed: boolean;
      headers: Record<string, string>;
      response?: Response;
    } {
      const ip = getClientIP(req);
      const endpoint = req.nextUrl?.pathname || 'api';
      const result = limiter.check(ip, endpoint);

      const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(limiter['max'] || 3),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      };

      if (!result.allowed) {
        headers['Retry-After'] = String(result.retryAfter);
        const response = new Response(
          JSON.stringify({
            error: 'Too many requests',
            retryAfter: result.retryAfter,
            resetTime: new Date(result.resetTime).toISOString()
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            }
          }
        );
        return { allowed: false, headers, response };
      }

      return { allowed: true, headers };
    }
  };
}

/**
 * Standalone rate limit check for edge functions
 */
export async function checkRateLimit(
  ip: string,
  endpoint: string = 'api',
  options?: { max?: number; windowMs?: number }
): Promise<RateLimitResult> {
  const limiter = getGlobalLimiter(options);
  return limiter.check(ip, endpoint);
}
