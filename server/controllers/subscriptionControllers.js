import Razorpay  from "razorpay"


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});





export const createSubscription = async (req, res) => {
 const { planId } = req.body; 
  console.log(planId);
  try {
    // const subscription = await razorpay.subscriptions.create({plan_id: planId , total_count: 1});
    // console.log(subscription)
    // return res.json({ subscriptionId: subscription.id  });
    return res.json({ subscriptionId: "sub_Ra4mVbSZHQZB0D"  });
  } catch (error) {
    return res.status(500).json({ error: error.message }); 
  }
};

