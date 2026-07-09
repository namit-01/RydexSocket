import mongoose, { Document } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "partner", "admin"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    mobileNumber: {
      type: String,
    },

    partnerOnboardingSteps: {
      type: Number,
      min: 0,
      max: 8,
      default: 0,
    },
    partnerStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "rejected", "approved"],
    },
    rejectionReason: String,
    videoKycStatus: {
      type: String,
      enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
      default: "not_required",
    },
    videoKycRoomId: String,
    videoKycRejectionReason: String,
    socketId: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);
userSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", userSchema);
export default User;
