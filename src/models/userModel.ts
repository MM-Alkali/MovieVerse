import mongoose, { Schema, Document } from "mongoose";
import { MovieDocument, MovieSchema } from "./moviesModel";

export interface UserDocument extends Document {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  otp: any;
  expiry: any;
  movies: MovieDocument[];
  status: any
}

export const UserSchema = new Schema<UserDocument>({
  fullname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "suspended"],
    default: "pending",
  },
  otp: {
    type: Number,
  },
  expiry: {
    type: Date,
  },
  movies: {
    type: [MovieSchema],
    default: [],
  },
},
{
  timestamps: true,
}
);

export const User = mongoose.model<UserDocument>("User", UserSchema);
