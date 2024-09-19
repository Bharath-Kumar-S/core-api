import { Orders } from "../models/orders";
import { Request, Response } from "express";
import { calculateCgst, calculateSgst } from "../utils/utils";

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
  } = req.body;

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
  });

  return order ? res.status(201).send(order) : res.status(400).send("Error");
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await Orders.find()
    // .select("deckId remaining shuffled type -_id")
    .lean();
  return res.status(200).json(orders);
};

// @desc Fetch Deck
// @route GET /deck/deckId
// @access Private
export const getOrder = async (req: Request, res: Response) => {
  const { dc_no } = req.params;
  const order = await Orders.findOne({ dc_no: dc_no });
  // .select(
  //   "deckId remaining shuffled type cards -_id"
  // );
  order
    ? res.status(200).json(order)
    : res.status(400).json({ message: "Invalid dc_no received" });
};
