import IORedis from "ioredis";

export default new IORedis(process.env.REDIS_URL || "redis://localhost:6379");
