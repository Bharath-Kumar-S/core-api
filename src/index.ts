import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { postSubscriber } from "./controller/subscribeController";
import { orderRouter } from "./router/order";

dotenv.config();

const app = express();
const PORT = process.env.PORT === undefined ? 5001 : process.env.PORT;

app.use(express.json());
app.use(cors());

app.get("/health-check", (req, res) => {
  res.send({
    status: "OK",
  });
});

app.post("/subscribe", postSubscriber);
app.use("/orders", orderRouter);

app.listen(PORT, async () => {
  console.log(
    `⚡️⚡️⚡️[server]: Server is running at https://localhost:${PORT} ⚡️⚡️⚡️`
  );
  try {
    console.log("app is started");
    if (!(process.env.NODE_ENV === "test")) {
      mongoose.connect(`${process.env.DBSTRING}`);
      const db = mongoose.connection;
      db.on("error", (err) => {
        console.error(err);
      });
      db.on("open", () => console.log("Connected to DB!!!!"));
    }
  } catch (err) {
    console.log(err);
  }
});
