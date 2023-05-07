import mongoose, { Schema, Document } from "mongoose";
import { MovieDocument, MovieSchema } from "./moviesModel";

interface UserDocument extends Document {
  fullname: string;
  username: string;
  email: string;
  password: string;
  otp: number;
  otp_expiry: Date;
  reset_password_token?: string;
  reset_password_expiry?: Date;
  movies: MovieDocument[];
}

const UserSchema = new Schema<UserDocument>({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => {
        // Regex for validating email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long"],
  },
  otp: {
    type: Number,
    required: true,
  },
  otp_expiry: {
    type: Date,
    required: true,
  },
  reset_password_token: {
    type: String,
  },
  reset_password_expiry: {
    type: Date,
  },
  movies: {
    type: [MovieSchema],
    default: [],
  },
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
