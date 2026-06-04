import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true, index: true },
    affectedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true },
);

adminLogSchema.index({ createdAt: -1 });

export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
