import mongoose from "mongoose";

const mongooseSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensure emails are unique
      lowercase: true, // Normalize email to lowercase
      trim: true, // Remove whitespace around the email
      match: [/.+\@.+\..+/, "Please fill a valid email address"], // Basic email validation
    },
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model("Subscriber", mongooseSchema);
