import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redisURL = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(redisURL && redisToken) && !redisURL!.includes('your-upstash-instance');

export const redis = isConfigured ? new Redis({ url: redisURL!, token: redisToken! }) : null;

const authLimiter = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'hiregate:auth'
}) : null;

export async function checkAuthRateLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining?: number;
}> {
    if (!authLimiter) {
        return { allowed: true };
    }



    const { success, remaining } = await authLimiter.limit(identifier);
    return { allowed: success, remaining }
}