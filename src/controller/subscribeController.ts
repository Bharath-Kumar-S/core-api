import { Subscriber } from "../models/subscribe";
import { Request, Response } from "express";

// Create a new subscriber
// export const postSubscriber = async (req: Request, res: Response) => {
//   const { email } = req.body;

//   try {
//     // Check if the email already exists
//     const isEmailExist = await Subscriber.findOne({ email });
//     if (isEmailExist) {
//       return res.status(400).send({ error: "Email already exists" });
//     }

//     // Create new subscriber
//     const subscriber = await Subscriber.create({ email });
//     return res.status(201).send(subscriber);
//   } catch (error) {
//     return res
//       .status(500)
//       .send({ error: "Error creating subscriber", details: error });
//   }
// };

// Get all subscribers
export const getSubscriber = async (req: Request, res: Response) => {
  try {
    const subscribers = await Subscriber.find();
    return res.status(200).send(subscribers);
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error fetching subscribers", details: error });
  }
};

// Delete a subscriber by ID
export const deleteSubscriber = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).send({ error: "Subscriber not found" });
    }
    return res
      .status(200)
      .send({ message: "Subscriber deleted successfully", subscriber });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error deleting subscriber", details: error });
  }
};

// Update a subscriber by ID
export const updateSubscriber = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subscriber = await Subscriber.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!subscriber) {
      return res.status(404).send({ error: "Subscriber not found" });
    }
    return res.status(200).send(subscriber);
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error updating subscriber", details: error });
  }
};

// Get a single subscriber by ID
export const getSubscriberById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).send({ error: "Subscriber not found" });
    }
    return res.status(200).send(subscriber);
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error fetching subscriber", details: error });
  }
};
