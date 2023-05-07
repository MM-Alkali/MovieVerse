import mongoose, { Schema, Document } from "mongoose";

export interface ResetAttributes extends Document {
  id: string;
  email: string;
  token: string;
  expires: Date;
  userId: string;
  code: string;
}

export const PasswordReset = new mongoose.Schema<ResetAttributes>(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    userId: {
      type: String,
    },
    code: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ResetPassword = mongoose.model<ResetAttributes>(
  "PasswordReset",
  PasswordReset
);
