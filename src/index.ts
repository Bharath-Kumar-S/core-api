import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { postSubscriber } from "./controller/subscribeController";
import { postOrder } from "./controller/orderController";
dotenv.config();

// Database Name
const dbName = "polar-web-io";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.get("/health-check", (req, res) => {
  res.send({
    status: "OK",
  });
});

app.post("/subscribe", postSubscriber);
app.post("/order", postOrder);

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
