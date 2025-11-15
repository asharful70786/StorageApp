import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import Subscription from "../models/subscriptionModel.js";




console.log(process.env.RAZORPAY_KEY_ID , process.env.RAZORPAY_KEY_SECRET)

const rzpInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({userId: req.user._id })
    res.json(subscriptions);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const createSubscription = async (req, res, next) => {
  console.log(req.body.planId);
  try {
    const newSubscription = await rzpInstance.subscriptions.create({
      plan_id: req.body.planId,
      total_count: 120,
      notes: {
        userId: req.user._id,
      },
    });

    const subscription = new Subscription({
      razorpaySubscriptionId: newSubscription.id,
      userId: req.user._id,
    });

    await subscription.save();
    res.json({ subscriptionId: newSubscription.id });
  } catch (err) {
    console.log(err);
    next(err);
  }
};



export const pauseSubscription = async (req , res) => {
 try {
   const {razorpaySubscriptionId} = req.body;
  await rzpInstance.subscriptions.pause(razorpaySubscriptionId);
   await Subscription.findOneAndUpdate({ razorpaySubscriptionId }, { status: "paused" });
  res.status(200).json({ message: "Subscription Paused" });
 } catch (error) {
  res.status(500).json({ error: "Failed to pause subscription" });
  console.log(error.message)
 }
}


export const resumeSubscription = async (req , res) => {
  try {
    const {razorpaySubscriptionId} = req.body;
   await rzpInstance.subscriptions.resume(razorpaySubscriptionId);
    await Subscription.findOneAndUpdate({ razorpaySubscriptionId }, { status: "active" });
   res.status(200).json({ message: "Subscription Resumed" });
  } catch (error) {
   res.status(500).json({ error: "Failed to resume subscription" });
   console.log(error.message)
  }
}

export const cancelSubscription = async (req , res) => {
  try {
    const {razorpaySubscriptionId} = req.body;
   await rzpInstance.subscriptions.cancel(razorpaySubscriptionId);
    await Subscription.findOneAndUpdate({ razorpaySubscriptionId }, { status: "cancelled" });
    //storage access less 
    await User.findOneAndUpdate({ id : req.user._id },  { maxStorageInBytes: 15 * 1024 ** 3 }); // back to normal limit 
   res.status(200).json({ message: "Subscription Cancelled" });
  } catch (error) {
   res.status(500).json({ error: "Failed to cancel subscription" });
   console.log(error.message)
  }
}
