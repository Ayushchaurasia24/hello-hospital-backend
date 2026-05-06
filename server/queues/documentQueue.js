import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

const documentQueue = new Queue(
  "document-processing",
  {
    connection: redisConnection,
  }
);

export default documentQueue;