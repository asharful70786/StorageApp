import Razorpay from "razorpay";
import { PLAN_STORAGE_MAP } from "../config/planConfig.js";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";

export const webHookEvent = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_webhookSecret;
    const rawBody = req.body.toString();

    // ✅ Verify signature
    const isValid = Razorpay.validateWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!isValid) {
      console.log("❌ Invalid signature");
      return res.status(400).json({ status: "verification failed" });
    }

    const parsedBody = JSON.parse(rawBody);
    const event = parsedBody.event;
    const subEntity = parsedBody?.payload?.subscription?.entity;

    // ✅ Extract IDs safely
    const userId = subEntity?.notes?.userId;
    const planId = subEntity?.plan_id;

    if (!userId || !planId) {
      console.log(`userId ${userId} planId ${planId}`);
      console.warn("⚠️ Missing userId or planId in webhook");
      return res.status(400).json({ status: "missing parameters" });
    }

    // ✅ Calculate plan storage limit
    const storageLimit = PLAN_STORAGE_MAP[planId] || 2 * 1024 * 1024 * 1024; // default 2 GB

    // ✅ Handle event types
    switch (event) {
      // 1️⃣ Created
      case "subscription.created":
        await Subscription.create({
          subscriptionId: subEntity.id,
          userId,
          status: subEntity.status || "created",
          plan: planId,
          createdAt: new Date(subEntity.created_at * 1000),
          updatedAt: new Date(),
        });
        console.log("🟢 Subscription created:", subEntity.id);
        break;

      // 2️⃣ Activated
      case "subscription.activated": {
        await Subscription.findOneAndUpdate(
          { subscriptionId: subEntity.id },
          { status: "active", updatedAt: new Date() }
        );

        const startDate = new Date(subEntity.start_at * 1000);
        const endDate = new Date(subEntity.current_end * 1000);

        await User.findByIdAndUpdate(userId, {
          currentPlan: planId,
          subscriptionId: subEntity.id,
          planStatus: "active",
          planStart: startDate,
          planEnd: endDate,
          maxStorageInBytes: storageLimit,
        });

        console.log(
          `💎 Activated plan ${planId} → storage set to ${storageLimit} bytes`
        );
        break;
      }

      // 3️⃣ Cancelled
      case "subscription.cancelled":
        await Subscription.findOneAndUpdate(
          { subscriptionId: subEntity.id },
          { status: "canceled", updatedAt: new Date() }
        );

        await User.findByIdAndUpdate(userId, {
          planStatus: "canceled",
          maxStorageInBytes: 5 * 1024 * 1024 * 1024, // 5 GB fallback
        });

        console.log("❌ Subscription cancelled:", subEntity.id);
        break;

      // 4️⃣ Expired
      case "subscription.expired":
        await Subscription.findOneAndUpdate(
          { subscriptionId: subEntity.id },
          { status: "expired", updatedAt: new Date() }
        );

        await User.findByIdAndUpdate(userId, {
          planStatus: "expired",
          maxStorageInBytes: 5 * 1024 * 1024 * 1024,
        });

        console.log("🕓 Subscription expired:", subEntity.id);
        break;

      // 5️⃣ Completed (cycle ended normally)
      case "subscription.completed":
        await Subscription.findOneAndUpdate(
          { subscriptionId: subEntity.id },
          { status: "completed", updatedAt: new Date() }
        );

        await User.findByIdAndUpdate(userId, {
          planStatus: "completed",
          maxStorageInBytes: 5 * 1024 * 1024 * 1024,
        });

        console.log("🏁 Subscription completed:", subEntity.id);
        break;

      // 6️⃣ Fallback
      default:
        console.log("ℹ️ Unhandled event:", event);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    res.status(400).json({ status: "verification failed" });
  }
};
