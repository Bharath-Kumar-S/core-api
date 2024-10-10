import express from "express";
import { getOrder, getOrders, postOrder } from "../controller/orderController";

const router = express.Router();
router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", postOrder);

export const orderRouter = router;
