import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Upstash Redis credentials are not set in .env.local');
}

const redis = Redis.fromEnv();

export default redis;