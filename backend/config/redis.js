import { createClient } from "redis";

const RedisClient = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export default RedisClient;