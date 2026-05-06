import Redis from "ioredis";

const redisConnection = new Redis({
  maxRetriesPerRequest: null,
});

export default redisConnection;