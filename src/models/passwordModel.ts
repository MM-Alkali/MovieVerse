import mongoose, { Schema, Document } from "mongoose";
import { UserDocument, UserSchema } from "./userModel";

export interface ResetInfo extends Document {
  userId: UserDocument;
  email: string;
  token: any;
  otp: any;
  expiry: any;
}

const ResetSchema = new mongoose.Schema<ResetInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    otp: {
      type: Number,
    },
    expiry: {
      type: Date,
    },
  },
);

export const Password = mongoose.model<ResetInfo>("Password", ResetSchema);
