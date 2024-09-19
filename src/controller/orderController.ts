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

   // Data validation
   if (to === "" || e_way_no === "" || party_gstin === "" || hsn_code === "" || product_description === "" ||
     vehicle_no === "" || handling_charges === "" || cgst === "" || sgst === "")
    return res.status(400).json({ message: "All fields are required" });

   if (typeof to !== "string" || typeof e_way_no !== "string" || typeof party_gstin !== "string" || typeof hsn_code !== "string" || typeof product_description !== "string" || 
       typeof vehicle_no !== "string" || typeof handling_charges !== "number" || typeof cgst !== "number" || typeof sgst !== "number" )
    return res.status(400).json({ message: "Invalid input type" });

    if(!Array.isArray(items)){
      return res.status(400).json({ message: "Invalid input array" });
    }

    for  (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.item_name === " " || 
          item.meta_data.length === " " ||
          item.meta_data.width === " " ||
          item.meta_data.height === " " ||
          item.quantity === " " ||
          item.material_value === " " ||
          item.total_weight === " " ||
          item.rate === " ") {
        return res.status(400).json({ message: "Item fields are required" });
      }
      if(typeof item.item_name !== "string" ||
        typeof item.meta_data !== "object" ||
        typeof item.meta_data.length !== "number" ||
        typeof item.meta_data.width !== "number" ||
        typeof item.meta_data.height !== "number" ||
        typeof item.quantity !== "number" ||
        typeof item.material_value !== "string" ||
        typeof item.total_weight !== "string" ||
        typeof item.rate !== "number"){
        return res.status(400).json({ message: "Invalid item format" });
      }
    }

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

// @desc Get all orders
// @route GET /orders
export const getOrders = async (req: Request, res: Response) => {
  const orders = await Orders.find()
    // .select("deckId remaining shuffled type -_id")
    .lean();
  return res.status(200).json(orders);
};

// @desc Fetch order
// @route GET /order/:dc_no
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
