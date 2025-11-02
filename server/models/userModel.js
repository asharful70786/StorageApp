import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    // 👤 Basic Info
    name: {
      type: String,
      required: true,
      minLength: [3, "name field should have at least three characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "please enter a valid email",
      ],
    },
    password: {
      type: String,
      minLength: 4,
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
    picture: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg",
    },
    role: {
      type: String,
      enum: ["Admin", "Manager", "User"],
      default: "User",
    },

    // 💳 Subscription & Billing
    planStatus: {
      type: String,
      enum: ["inactive", "active", "canceled", "expired", "completed"],
      default: "inactive",
    },
    currentPlan: {
      type: String,
      default: "free", // Razorpay plan_id or label
    },
    subscriptionId: {
      type: String,
      default: null, // Razorpay subscription ID
    },
    planStart: {
      type: Date,
      default: null,
    },
    planEnd: {
      type: Date,
      default: null,
    },
    maxStorageInBytes: {
      type: Number,
      required: true,
      default: 1 * 1024 ** 3, // 1 GB free tier
    },

    // 🗑️ Soft delete flag
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: "throw", // ensures no undeclared field can be saved
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.index({ email: 1 });
userSchema.index({ subscriptionId: 1 });
userSchema.index({ planStatus: 1 });

const User = model("User", userSchema);
export default User;
