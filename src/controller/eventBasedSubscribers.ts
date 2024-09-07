import { Subscriber } from "../models/subscribe";
import { Request, Response } from "express";
import AWS, { AWSError } from "aws-sdk";

import * as dotenv from "dotenv";
dotenv.config();

// Initialize AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// const sqs = new AWS.SQS();
const sns = new AWS.SNS();
const sqsQueueUrl = process.env.SQS_QUEUE_URL;
const snsTopicArn = process.env.SNS_TOPIC_ARN;

// Create a new subscriber and push data to SQS and SNS
export const postSubscriber = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the database
    const isEmailExist = await Subscriber.findOne({ email });
    if (isEmailExist) {
      return res.status(400).send({ error: "Email already exists" });
    }

    // Prepare subscriber data to be sent to SQS
    const messageBody = JSON.stringify({ email });

    // Send data to SQS
    // const sqsParams = {
    //   MessageBody: messageBody,
    //   QueueUrl: sqsQueueUrl,
    // };

    // await sqs.sendMessage(sqsParams).promise();

    // Send notification via SNS (if needed)
    const snsParams = {
      Message: messageBody,
      TopicArn: snsTopicArn,
      MessageGroupId: "subscribers",
      MessageDeduplicationId: `${email}-${Date.now()}`,
    };

    await sns.publish(snsParams).promise();

    // Respond to the client immediately
    return res.status(201).send({ message: "Subscriber request received" });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error creating subscriber", details: error });
  }
};
