import redisClient from "./redis.js";

export const createUserIdIndex = async () => {
  console.log("🔍 Checking if Redis index exists...");

  try {
    await redisClient.ft.create(
      "userIdIdx",
      {
        "$.userId": { type: "TAG", AS: "userId" },
        "$.rootDirId": { type: "TAG", AS: "rootDirId" },
      },
      {
        ON: "JSON",
        PREFIX: "session:",
      }
    );
    console.log("✅ Redis index 'userIdIdx' created successfully!");
  } catch (err) {
    if (err.message.includes("Index already exists")) {
      console.log("ℹ️ Redis index 'userIdIdx' already exists — skipping creation.");
    } else {
      console.error("❌ Error creating Redis index:", err);
    }
  }
};
