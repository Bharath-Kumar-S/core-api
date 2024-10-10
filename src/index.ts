import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { postSubscriber } from "./controller/subscribeController";
import { orderRouter } from "./router/order";
import { generatePDF } from "./controller/orderController";
import { generateDcPDF } from "./utils/utils";
import cookieParser from "cookie-parser";
import { authRouter } from "./router/auth.routes";
import { usersRouter } from "./router/users.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT === undefined ? 5001 : process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.get("/health-check", (req, res) => {
  res.send({
    status: "OK",
  });
});

app.get("/api/healthcheck", (re, res) => {
  res.status(200).send("OK");
});
app.post("/subscribe", postSubscriber);
app.use("/orders", orderRouter);
app.get("/pdf/:id", generatePDF);
app.get("/dc/:id", generateDcPDF)
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
     
const server = app.listen(PORT, async () => {
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

export { app, server };
