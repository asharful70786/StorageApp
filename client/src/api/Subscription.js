import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const CreateSubscription = async (planId) => {
  const { data } = await axiosWithCreds.post("subscription/create" , {planId});
  return data;
};


// export const CancelSubscription = async () => {
//   const { data } = await axiosWithCreds.post("/subscription/cancel");
//   return data;
// };