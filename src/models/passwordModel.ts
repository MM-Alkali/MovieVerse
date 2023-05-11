import mongoose, { Schema, Document } from "mongoose";
import { UserDocument, UserSchema } from "./userModel";

export interface ResetInfo extends Document {
  email: string;
  token: string;
  token_expiry: Date;
  userId: UserDocument;
  otp: number;
  otp_expiry: Date;
}

export const PasswordReset = new mongoose.Schema<ResetInfo>(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    token_expiry: {
      type: Date,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    otp: {
      type: Number,
      required: true,
    },
    otp_expiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ResetPassword = mongoose.model<ResetInfo>(
  "PasswordReset",
  PasswordReset
);
