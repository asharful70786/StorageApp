import mongoose from "mongoose";


const SubscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
  },
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true,
  },
  status : {
    type : String,
    enum : ["created" , "pending", "active", "canceled", "incomplete_expired", "incomplete", "expired" , "in_Gray"],
    default : "created"
  },
  plan : {
    type : String,
    required : true,
  },
  createdAt : {
    type : Date,
    default : Date.now,
  },
  updatedAt : {
    type : Date,
    default : Date.now,
  },


});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;