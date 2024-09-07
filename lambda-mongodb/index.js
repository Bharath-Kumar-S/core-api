const mongoose = require("mongoose");
const Subscriber = require("./subscriberModel"); // Mongoose model for the subscriber
const AWS = require("aws-sdk"); // AWS SDK for SQS

const sqs = new AWS.SQS(); // Initialize SQS service
const uri = process.env.MONGODB_URI; // MongoDB URI from environment variables
let isConnected = false; // Track the database connection state

// Lambda handler function
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2)); // Log the event object

  if (!isConnected) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      return { statusCode: 500, body: "MongoDB connection error" };
    }
  }

  try {
    // Check if event.Records is defined and is an array
    if (Array.isArray(event.Records)) {
      for (const record of event.Records) {
        // Parse the SNS message from the SQS body
        const snsMessage = JSON.parse(record.body);
        const message = JSON.parse(snsMessage.Message); // Extract the actual message

        const { email } = message;

        // Insert email into MongoDB using Mongoose
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        console.log(`Successfully inserted subscriber: ${email}`);

        // Delete the message from SQS
        const deleteParams = {
          QueueUrl: process.env.SQS_QUEUE_URL, // SQS Queue URL
          ReceiptHandle: record.receiptHandle, // ReceiptHandle from the SQS message
        };

        await sqs.deleteMessage(deleteParams).promise();
        console.log(`Deleted message from queue: ${record.receiptHandle}`);
      }

      return { statusCode: 200, body: "Success" };
    } else {
      console.error("No records found in event.");
      return { statusCode: 400, body: "No records found in event." };
    }
  } catch (error) {
    console.error("Error processing SQS message:", error.message);
    return { statusCode: 500, body: "Error saving subscriber" };
  }
};
