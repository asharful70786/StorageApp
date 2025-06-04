import User from "../models/userModel.js";
import Session from "../models/sessionModel.js";
import redisClient from "../config/redis.js";

export default async function checkAuth(req, res, next) {
  try {
    const { sid } = req.signedCookies;
    if (!sid) {
      return res.status(401).json({ error: "Not logged in!" });
    }
    const session = await redisClient.json.get(`session:${sid}`);
    if (!session) {
      res.clearCookie("sid");
      return res.status(401).json({ error: "Session expired or invalid!" });
    }
    req.user = {
      _id: session.userId,
      rootDirId: session.rootDirId, //login time root dir id set in  redis session 
    };
    next();
  } catch (error) {
    console.error("checkAuth error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
export const roleBaseAccessMiddleware = (req, res, next) => {
  if (req.user.role == "user") {
    return res.status(403).json({ error: "You are not Authorizes to login the  page " });
  }
  next();
};