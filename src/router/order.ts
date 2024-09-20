import express from "express";
import {
  generatePDF,
  getOrder,
  getOrders,
  postOrder,
} from "../controller/orderController";
import { Orders } from "../models/orders";

const router = express.Router();
router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", postOrder);
router.get("/pdf/:id", generatePDF);

export const orderRouter = router;
