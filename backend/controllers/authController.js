import Otp from "../models/otpModel.js";
import { sendOtp } from "../services/otpService.js";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose, { Types } from "mongoose";
import { loginWithGoogle } from "../services/loginWithGoogle.js";
import Session from "../models/sessionModel.js";
import RedisClient from "../config/redis.js";

const sendOtpRequest = async (req, res) => {

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(404).json({ message: "User user already exist with this email" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const resData = await sendOtp(email);
    return res.status(200).json({ message: resData.message });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};


const verifyOtpRequest = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: "Invalid OTP or expired" });
    }
    await Otp.deleteOne({ email });
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};


export const continueWithGoogle = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  let userInfo;
  try {
    userInfo = await loginWithGoogle(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid Google token" });
  }

  const { name, email, picture } = userInfo;


  try {
    const user = await User.findOne({ email });

    if (user) {
      if (user.isDeleted) {
        res.clearCookie("sid");
        return res.status(403).json({ message: "Your account has been deleted or blocked. Please contact the admin." });
      }

      const result = await RedisClient.ft.search("userIdIdx", `@userId:{${user._id}}`);
      console.log(result);
      const allSessions = result.documents || [];
      if (allSessions.length >= 2) {
        await RedisClient.del(allSessions[0].id);
      }

      // login here 
      const sessionId = crypto.randomUUID();
      const redisKey = `session:${sessionId}`;
      await RedisClient.json.set(redisKey, "$", { userId: user._id, rootDirId: user.rootDirId });
      const sessionTTLSeconds = 60 * 60 * 24 * 7; // 7 days
      await RedisClient.expire(redisKey, sessionTTLSeconds);

      res.cookie("sid", sessionId, {
        httpOnly: true,
        signed: true,
        maxAge: sessionTTLSeconds * 1000, // 7 days in ms
      });
      return res.status(200).json({ message: "Logged In" });

    }
    const session = await mongoose.startSession();
    session.startTransaction();

    const newUserId = new Types.ObjectId();
    const rootDirId = new Types.ObjectId();

    // Create root directory for the user
    await Directory.create(
      [{
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId: newUserId
      }],
      { session }
    );

    // Create user document
    await User.create(
      [{
        _id: newUserId,
        name,
        email,
        picture,
        rootDirId
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`;
    await RedisClient.json.set(redisKey, "$", { userId: user._id, rootDirId: user.rootDirId });
    const sessionTTLSeconds = 60 * 60 * 24 * 7;
    await RedisClient.expire(redisKey, sessionTTLSeconds);

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: sessionTTLSeconds * 1000, // 7 days in ms
    });
    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Error in continueWithGoogle:", error);

    // Handle MongoDB JSON Schema validation error
    if (error.name === "MongoServerError" && error.code === 121) {
      const validationErrors = error.errInfo?.details?.schemaRulesNotSatisfied || [];

      // Log each detailed validation issue
      console.error("Validation details:", JSON.stringify(validationErrors, null, 2));

      return res.status(400).json({
        error: "User validation failed",
        validationIssues: validationErrors
      });
    }
  }

};
export const continueWithGithub = async (req, res) => {
  const code = req.query.code;

  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Step 2: Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });
    const userData = await userResponse.json();

    // Step 3: Get verified primary email
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const emails = await emailRes.json();
    if (!emails) {
      return res.status(400).json({ error: 'No emails found on GitHub account' });
    }
    const primaryEmail = emails.find(email => email.primary && email.verified)?.email;

    if (!primaryEmail) {
      return res.status(400).json({ error: 'No verified email found on GitHub account' });
    }

    let { avatar_url, name } = userData;
    if (!name) {
      name = primaryEmail.split('@')[0];
    }
    const email = primaryEmail;

    // Step 4: Check if user already exists
    let user = await User.findOne({ email });
    //soft deleted apply
    if (user) {
      if (user.isDeleted) {
        res.clearCookie("sid");
        return res.status(403).json({ message: "Your account has been deleted or blocked. Please contact the admin." });
      }
    }

    if (user) {
      const result = await RedisClient.ft.search("userIdIdx", `@userId:{${user._id}}`);
      const allSessions = result.documents || [];
      if (allSessions.length >= 2) {
        await RedisClient.del(allSessions[0].id);
      }
      const sessionId = crypto.randomUUID();
      const redisKey = `session:${sessionId}`;
      await RedisClient.json.set(redisKey, "$", { userId: user._id, rootDirId: user.rootDirId });
      const sessionTTLSeconds = 60 * 60 * 24 * 7;
      await RedisClient.expire(redisKey, sessionTTLSeconds);

      res.cookie("sid", sessionId, {
        httpOnly: true,
        signed: true,
        maxAge: sessionTTLSeconds * 1000, // 7 days in ms
      });

      return res.redirect("http://localhost:5173");

    }

    // Step 5: Register new user
    const sessionDb = await mongoose.startSession();
    sessionDb.startTransaction();

    const newUserId = new Types.ObjectId();
    const rootDirId = new Types.ObjectId();

    await Directory.create(
      [{
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId: newUserId,
      }],
      { session: sessionDb }
    );

    await User.create(
      [{
        _id: newUserId,
        name,
        email,
        picture: avatar_url,
        rootDirId,
      }],
      { session: sessionDb }
    );

    await sessionDb.commitTransaction();
    sessionDb.endSession();
    return res.status(201).json({ message: "User registered with GitHub" });

  } catch (error) {
    console.error("Error in continueWithGithub:", error);
    return res.status(500).json({ error: "GitHub login failed" });
  }
};

export { sendOtpRequest, verifyOtpRequest };
