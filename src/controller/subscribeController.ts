import { Subscriber } from "../models/subscribe";
import { Request, Response } from "express";

export const postSubscriber = async (req: Request, res: Response) => {
  const { email } = req.body;

  const isEmailExist = await Subscriber.findOne({ email });
  if (isEmailExist) {
    return res.status(400).send({ error: "Email already exist" });
  }
  const subscriber = await Subscriber.create({
    email,
  });
  return subscriber
    ? res.status(201).send(subscriber)
    : res.status(400).send("Error");
};
