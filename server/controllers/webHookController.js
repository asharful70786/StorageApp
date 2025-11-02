import Razorpay from "razorpay";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";

export const PLANS = {
  plan_Raqy2E1vxhYXal: {
    storageQuotaBytes: 2 * 1024 ** 4, // 2TB
  },
  plan_RaqxLEwNWBPd6w: {
    storageQuotaBytes: 10 * 1024 ** 4, // 10TB
  },
  plan_Raqw6DQrTjugDr: {
    storageQuotaBytes: 5 * 1024 ** 4, // 5TB
  },
  plan_RaqvMy4nCcOGfP: {
    storageQuotaBytes: 2 * 1024 ** 4, // 2TB
  },
  plan_RaqtQwrVBIWENX: {
    storageQuotaBytes: 10 * 1024 ** 4, // 10TB
  },
  plan_Raqsgp8AWUiOll: {
    storageQuotaBytes: 5 * 1024 ** 4, // 5TB
  },
  plan_RaqrMweXFtMBIJ: {
    storageQuotaBytes: 2 * 1024 ** 4, // 2TB
  },
  plan_RTFCU02Ktbi1Fi: {
    storageQuotaBytes: 2 * 1024 ** 4, // 2TB (Test plan)
  },
};



export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const isSignatureValid = Razorpay.validateWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.RAZORPAY_webhookSecret
  );
  if (isSignatureValid) {
    console.log("Signature verified");
    
    console.log(req.body);
    if (req.body.event === "subscription.activated") {
      const rzpSubscription = req.body.payload.subscription.entity;
      const planId = rzpSubscription.plan_id;
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: rzpSubscription.id,
      });
      subscription.status = rzpSubscription.status;
      await subscription.save();
      const storageQuotaBytes = PLANS[planId].storageQuotaBytes;
      const user = await User.findById(subscription.userId);
      user.maxStorageInBytes = storageQuotaBytes;
      await user.save();
      console.log("subscription activated");
    }
  } else {
    console.log("Signature not verified");
  }
  res.end("OK");
};
