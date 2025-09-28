require("dotenv").config();
const redis = require("redis");

const redisServer = process.env.REDIS_SERVER;

//rate limiting using Redis
const redisClient = redis.createClient({ url: redisServer });
redisClient.connect();
redisClient.on("connect", () => console.log("Connected to Redis on ", redisServer));
redisClient.on("error", (error) => console.error("Redis error", error));

const rateLimit = 10, expireTime = 60;
const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip;
        const key = `rate_limit:${ip}`;

        const requestCount = await redisClient.get(key);
        if (!requestCount) { //if no request count, set it to 1
            await redisClient.set(key, 1, { EX: expireTime });
            res.setHeader("X-RateLimit-Limit", rateLimit);
            res.setHeader("X-RateLimit-Remaining", rateLimit - 1);
            res.setHeader("X-RateLimit-Reset", new Date(Date.now() + expireTime * 1000).toISOString());
            return next();
        }

        if (parseInt(requestCount) >= rateLimit) { // if request count is greater than or equal to rate limit
            const ttl = await redisClient.ttl(key); // get the time to live of the key - that was the time when the request count was set
            res.setHeader("Retry-After", ttl);
            return res.status(429).json({ message: "Rate limit exceeded" });
        }

        await redisClient.incr(key);
        res.setHeader("X-RateLimit-Limit", rateLimit);
        res.setHeader("X-RateLimit-Remaining", rateLimit - parseInt(requestCount) - 1);
        res.setHeader("X-RateLimit-Reset", new Date(Date.now() + expireTime * 1000).toISOString());
        return next();
    } catch (error) {
        console.error("rateLimiter error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { rateLimiter };