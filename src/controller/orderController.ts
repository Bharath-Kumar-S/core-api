import { Orders } from "../models/orders";
import { Request, Response } from "express";
import { calculateCgst, calculateSgst } from "../utils/utils";
import { OrderType } from "../types/Order";

export const postOrder = async (req: Request, res: Response) => {
  const {
    to,
    e_way_no,
    party_gstin,
    hsn_code,
    product_description,
    items,
    vehicle_no,
    handling_charges,
    cgst,
    sgst,
    total_weight,
  } = req.body;

  console.log(req.body)

  const values = {
    to,
    e_way_no,
    party_gstin,
    hsn_code,
    product_description,
    items,
    vehicle_no,
    handling_charges,
    cgst,
    sgst,
    total_weight,
  };

  const dc_no = (await Orders.estimatedDocumentCount()) + 1;
  const invoice_no = dc_no;
  const party_dc_no = dc_no;
  const party_dc_date = new Date();
  const date = new Date();
  const calculatedItems = items.map(
    (item: { quantity: number; rate: number }) => {
      return {
        ...item,
        amount: item.quantity * item.rate,
      };
    }
  );

  const net_total = calculatedItems.reduce(
    (acc: any, cur: { amount: number }) => {
      return acc + cur.amount;
    },
    0
  );
  const calculatedSgst = calculateSgst(net_total);
  const calculatedCgst = calculateCgst(net_total);
  const gross_total = net_total + calculatedSgst + calculatedCgst;

  const updatedValues: OrderType = {
    ...values,
    dc_no,
    invoice_no,
    party_dc_no,
    party_dc_date,
    date,
    items: calculatedItems,
    sgst: calculatedSgst,
    cgst: calculatedCgst,
    gross_total,
    net_total,
  };

  for (let key in updatedValues) {
    // @ts-ignore
    if (!updatedValues[key]) {
      return res.status(400).json({ message: `${key} is required` });
    }
  }

  try {
    const order = await Orders.create({
      to,
      e_way_no,
      party_gstin,
      hsn_code,
      product_description,
      items: calculatedItems,
      vehicle_no,
      handling_charges,
      cgst,
      sgst,
      dc_no,
      invoice_no,
      party_dc_no,
      party_dc_date,
      date,
      net_total,
      calculatedSgst,
      calculatedCgst,
      gross_total,
      total_weight,
    });
    return order ? res.status(201).send(order) : res.status(400).send("Error");
  } catch (err) {
    //@ts-ignore
    return res.status(400).json({ message: err });
  }
};

// @desc Get all orders
// @route GET /orders
export const getOrders = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const pageNumber = parseInt(page as string) || 1;
  const limitNumber = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  const orders = await Orders.find().lean();
  const total = await Orders.countDocuments();
  const totalPages = Math.ceil(total / limitNumber);
  const data = {
    page: pageNumber,
    total,
    totalPages,
    orders: orders.slice(skip, skip + limitNumber),
  };
  return res.status(200).json(data);
};

// @desc Fetch order
// @route GET /order/:dc_no
export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Orders.findOne({ dc_no: id });
  order
    ? res.status(200).json(order)
    : res.status(400).json({ message: "Invalid dc_no received" });
};
