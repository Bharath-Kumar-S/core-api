const mongoose = require("mongoose");

// Define a schema for your subscriber
const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Create the Mongoose model
const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = Subscriber;
