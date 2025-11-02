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
    const subscription = await razorpay.subscriptions.create({plan_id: planId , total_count: 1});
    // console.log(subscription);
  
    const sub = await Subscription.create({
      subscriptionId: subscription.id,
      userId: req.user._id,
      plan: planId,
    });

    return res.json({ subscriptionId: subscription.id  });
  


    // return res.json({ subscriptionId: "sub_Ra4mVbSZHQZB0D"  });
  } catch (error) {
    return res.status(500).json({ error: error.message }); 
  }
};

