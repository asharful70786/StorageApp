import { createClient } from "redis";

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-13645.c258.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 13645
    }
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;

