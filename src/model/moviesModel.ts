import mongoose, { Schema, Document } from "mongoose";

export interface MovieDocument extends Document {
  title: string;
  description: string;
  image: object;
  price: number;
  userId: any;
}

export const MovieSchema = new mongoose.Schema<MovieDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
      validate: {
        validator: function (value: { mimetype: string; }) {
          return value && value.mimetype.startsWith("image/");
        },
        message: "Only image files are allowed",
      },
    },    
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const MovieModel = mongoose.model<MovieDocument>("Movie", MovieSchema);
