import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const createSubscription = async (planId) => {
  const { data } = await axiosWithCreds.post("/subscriptions", { planId });
  return data;
};
