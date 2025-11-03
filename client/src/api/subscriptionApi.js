import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";


export const fetchSubscriptions = async () => {
  const { data } = await axiosWithCreds.get("/subscriptions/all");
  return data;
}

export const createSubscription = async (planId) => {
  const { data } = await axiosWithCreds.post("/subscriptions", { planId });
  return data;
};


// New: Pause subscription
export const pauseSubscription = async (razorpaySubscriptionId) => {
  const { data } = await axiosWithCreds.post("/subscriptions/pause" ,{razorpaySubscriptionId});
  return data;
};


export const resumeSubscription = async (razorpaySubscriptionId) => {
  const { data } = await axiosWithCreds.post("/subscriptions/resume" ,{razorpaySubscriptionId});
  return data;
};


export const cancelSubscription = async (razorpaySubscriptionId) => {
  const { data } = await axiosWithCreds.post("/subscriptions/cancel" ,{razorpaySubscriptionId});
  return data;
} 