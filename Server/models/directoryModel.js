import { model, Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
     size: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Directory",
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const Directory = model("Directory", directorySchema);

export default Directory;
