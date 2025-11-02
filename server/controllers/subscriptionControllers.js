import Razorpay  from "razorpay"
import Subscription from "../models/subscriptionModel.js";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});





export const createSubscription = async (req, res) => {
 const { planId } = req.body; 
  console.log(planId);
  try {
    const subscription = await razorpay.subscriptions.create({plan_id: planId , total_count: 1 , notes: {
  userId: req.user._id.toString()}});

  
    const sub = await Subscription.create({
      subscriptionId: subscription.id,
      userId: req.user._id,
      plan: planId,
    });
    console.log(sub);

    return res.json({ subscriptionId: subscription.id , userId: req.user._id });
  
  } catch (error) {
    return res.status(500).json({ error: error.message }); 
  }
};

